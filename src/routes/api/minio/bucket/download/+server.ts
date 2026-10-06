import { minioClient } from '$lib/minio.js';
import { once } from 'events';
import { createWriteStream, mkdir } from 'fs';
import type { Client } from 'minio';
import { dirname, join } from 'path';

export async function POST({ request }) {
	let { bucket } = await request.json();
	let baseDir = `C:/Users/gorbu/Desktop/${bucket}`;

	await downloadBucket(minioClient, bucket, baseDir);

	return new Response();
}

async function downloadObject(
	minioClient: Client,
	bucketName: string,
	objectName: string,
	baseDir: string
) {
	// 1. Формируем полный локальный путь
	const localPath = join(baseDir, objectName);

	// 2. Получаем путь к папке (без имени файла)
	const dirPath = dirname(baseDir + '/' + objectName);

	// 3. Создаём все недостающие папки (recursive: true — создаст всю цепочку)
	mkdir(dirPath, { recursive: true }, async () => {
		// // 4. Создаём поток записи
		if (objectName.at(-1) != '/') {
			const writeStream = createWriteStream(baseDir + '/' + objectName);

			try {
				// 5. Запускаем скачивание
				const readStream = await minioClient.getObject(bucketName, objectName);
				readStream.pipe(writeStream);

				// Ждём окончания записи
				await once(writeStream, 'finish');
				console.log(`Файл сохранён: ${localPath}`);
			} catch (err) {
				console.error('Ошибка скачивания:', err);
				throw err;
			} finally {
				writeStream.destroy();
			}
		}
	});
}

async function downloadBucket(
	minioClient: Client,
	bucketName: string,
	baseDir: string,
	prefix = ''
) {
	// Собираем все имена объектов из потока listObjects
	const objects = await new Promise((resolve, reject) => {
		const names = [];
		const stream = minioClient.listObjects(bucketName, prefix, true);

		stream.on('data', (obj) => {
			if (obj.name) names.push(obj.name);
		});

		stream.on('error', (err) => reject(err));
		stream.on('end', () => resolve(names));
	});

	console.log(`Найдено объектов: ${objects.length}`);

	// Скачиваем по очереди (последовательно, чтобы не перегружать систему)
	for (const name of objects) {
		try {
			await downloadObject(minioClient, bucketName, name, baseDir);
		} catch (err) {
			console.error(`Пропускаем ${name}: ${err.message}`);
			// Продолжаем скачивать остальные, даже если один упал
		}
	}
}
