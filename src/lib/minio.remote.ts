import { command, getRequestEvent, query } from '$app/server';
import exifr from 'exifr';
import { createWriteStream, mkdir } from 'fs';
import { once } from 'events';
import { access, constants } from 'fs/promises';
import type { Client } from 'minio';
import { dirname } from 'path';
import * as v from 'valibot';
import { CACHE_CONTROL, minioClient } from './minio';

export const getBuckets = query(async () => {
	try {
		return minioClient.listBuckets();
	} catch (error) {
		return [];
	}
});

export const addBucket = query(v.string(), async (bucket) => {
	if (await minioClient.bucketExists(bucket)) return;

	try {
		await minioClient.makeBucket(bucket);
		return { result: 'ok' };
	} catch (error) {
		return { result: error };
	}
});

export const deleteBucket = query(v.string(), async (bucket) => {
	try {
		// Удаляем содержимое бакета
		const objectsStream = minioClient.listObjects(bucket, '', true);
		for await (const obj of objectsStream) {
			if (obj.isDir) continue;
			await minioClient.removeObject(bucket, obj.name);
		}
		// Удаляем сам бакет
		await minioClient.removeBucket(bucket);
		return { result: 'ok' };
	} catch (error) {
		return { result: error };
	}
});

export const downloadBucket = command(v.string(), async (bucket) => {
	let baseDir = `C:/Users/gorbu/Desktop/${bucket}`;

	// Собираем все имена объектов из потока listObjects
	const objects = await new Promise((resolve, reject) => {
		const names = [];
		const stream = minioClient.listObjects(bucket, '', true);

		stream.on('data', (obj) => {
			if (obj.name) names.push(obj.name);
		});

		stream.on('error', (err) => reject(err));
		stream.on('end', () => resolve(names));
	});

	let files = (objects as [])?.filter((o) => o?.at(-1) != '/');
	console.log(`Найдено файлов: ${files.length}`);

	const downloadPromises = files.map(async (name, i) => {
		try {
			await downloadObject(minioClient, bucket, name, baseDir, i + 1);
		} catch (err) {
			console.error(`Пропускаем ${name}: ${err.message}`);
			// Продолжаем скачивать остальные, даже если один упал
		}
	});

	// Скачиваем по очереди (последовательно, чтобы не перегружать систему)
	await Promise.all(downloadPromises);
});

export const getFolders = query(v.optional(v.string()), async (bucket) => {
	try {
		if (bucket) {
			const objects = await minioClient.listObjects(bucket, '', true);
			const folders = new Set<string>();

			for await (const objInfo of objects) {
				const name = objInfo.name;
				const lastSlash = name.lastIndexOf('/');

				if (lastSlash > 0) {
					const prefix = name.substring(0, lastSlash);
					folders.add(prefix);
				}
			}

			return Array.from(folders).sort((a: string, b: string) => a.localeCompare(b, 'ru'));
		}
	} catch (error) {
		return [];
	}
});

export const addFolder = command(
	v.object({
		bucket: v.string(),
		folder: v.string()
	}),
	async (data) => {
		if (data.bucket.trim() === '' && data.folder.trim() === '') return;

		// folder должен быть без начального слэша, например 'images/2024'
		const objectName = data.folder.endsWith('/') ? data.folder : data.folder + '/';

		await minioClient.putObject(
			data.bucket,
			objectName,
			Buffer.alloc(0), // пустой буфер
			0 // длина
		);
	}
);

export const deleteFolder = command(
	v.object({
		bucket: v.string(),
		folder: v.string()
	}),
	async (data) => {
		const objects = minioClient.listObjects(data.bucket, data.folder, true);
		const removeObjects = [];

		for await (const obj of objects) {
			removeObjects.push({ name: obj.name });
		}

		if (removeObjects.length != 0) await minioClient.removeObjects(data.bucket, removeObjects);
	}
);

export const getPhotos = query(
	v.object({
		bucket: v.optional(v.string()),
		folder: v.optional(v.string())
	}),
	async ({ bucket, folder }) => {
		if (!bucket || !folder) return [];

		const event = getRequestEvent(); // объявляем один раз, до цикла
		const prefix = folder.endsWith('/') ? folder : `${folder}/`;

		const images: { name: string; url: string }[] = [];

		for await (const obj of minioClient.listObjects(bucket, prefix, true)) {
			const ext = obj.name.split('.').pop()?.toLowerCase() ?? '';
			if (!['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'heic'].includes(ext)) {
				continue;
			}

			// только файлы непосредственно в папке, без подпапок
			if (obj.name.replace(prefix, '').includes('/')) continue;

			const url = new URL('/api/image', event.request.url);
			url.searchParams.set('bucket', bucket);
			url.searchParams.set('name', obj.name);

			images.push({ name: obj.name, url: url.toString() });
		}

		return images; // возвращаем сам массив
	}
);

export const addPhotos = command(
	v.object({
		bucket: v.string(),
		folder: v.string(),
		photos: v.array(v.blob())
	}),
	async (data) => {
		if (!data.photos || !(data.photos[0] instanceof Blob)) return;

		for (const f of data.photos) {
			const file = f as Blob & { name: string; type: string };
			const ext = file.name.split('.').pop()?.toLowerCase() || 'bin';
			const key = `${crypto.randomUUID()}.${ext}`;

			let buffer = Buffer.from(await file.arrayBuffer());
			await minioClient.putObject(data.bucket, `${data.folder}/${key}`, buffer, file.size, {
				'Content-Type': file.type,
				'Cache-Control': CACHE_CONTROL
			});
		}
	}
);

export const deletePhoto = command(
	v.object({
		bucket: v.string(),
		photo: v.string()
	}),
	async (data) => {
		await minioClient.removeObject(data.bucket, data.photo);
	}
);

export const getPhotoEXIF = query(v.string(), async (photo) => {
	const res = await fetch(photo);
	const tags = await exifr.parse(photo, {
		// Можно указать только нужные теги, чтобы еще больше ускорить процесс
		// pick: ['Make', 'Model', 'ISO', 'FNumber']
	});
	// console.log(tags);
	return tags;
});

// Вспомогательные методы
async function fileExists(path: string) {
	try {
		await access(path, constants.F_OK); // F_OK = проверка существования
		return true;
	} catch {
		return false;
	}
}

async function downloadObject(
	minioClient: Client,
	bucketName: string,
	objectName: string,
	baseDir: string,
	index: number
) {
	// 1. Формируем полный локальный путь
	const localPath = baseDir + '/' + objectName;

	// 2. Получаем путь к папке (без имени файла)
	const dirPath = dirname(baseDir + '/' + objectName);

	// Если файл уже есть, мы его не скачиваем
	if (await fileExists(localPath)) return;

	// 3. Создаём все недостающие папки (recursive: true — создаст всю цепочку)
	mkdir(dirPath, { recursive: true }, async () => {
		// 4. Создаём поток записи
		if (objectName.at(-1) != '/') {
			const writeStream = createWriteStream(localPath);

			try {
				// 5. Запускаем скачивание
				const readStream = await minioClient.getObject(bucketName, objectName);
				readStream.pipe(writeStream);

				// Ждём окончания записи
				await once(writeStream, 'finish').then((_) => {
					console.log(`${index ? index + '. ' : ''}Файл сохранён: ${localPath}`);
				});
			} catch (err) {
				console.error('Ошибка скачивания:', err);
				throw err;
			} finally {
				writeStream.destroy();
			}
		}
	});
}

export const uploadFile = command(
	v.object({ bucket: v.string(), folder: v.string(), photo: v.file() }),
	async (data) => {
		const ext = data.photo.name.split('.').pop()?.toLowerCase() || 'bin';
		const key =
			`${data.folder.replace(/^\/+/, '').replace(/\/+$/, '')}/${crypto.randomUUID()}`.replace(
				/\/+/g,
				'/'
			) + `.${ext}`;

		const buffer = Buffer.from(await data.photo.arrayBuffer());

		await minioClient.putObject(
			data.bucket,
			key,
			buffer,
			buffer.length, // размер буфера, совпадает с photo.size
			{
				'Content-Type': data.photo.type || `application/${ext}`,
				'Cache-Control': CACHE_CONTROL
			}
		);
	}
);
