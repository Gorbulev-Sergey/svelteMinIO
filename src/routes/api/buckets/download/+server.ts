import { minioClient } from '#lib/minio.ts';
import type { Client } from 'minio';
import { dirname } from 'path';
import { access, constants } from 'fs/promises';
import { createWriteStream, mkdir } from 'fs';
import { once } from 'events';

export async function POST({ request }) {
	let { bucket } = await request.json();

	// Скачиваем по очереди (последовательно, чтобы не перегружать систему)
	try {
		// Куда скачиваем файлы
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

		await Promise.all(downloadPromises);
		return new Response(JSON.stringify({ status: 'ok' }));
	} catch (error) {
		return new Response(JSON.stringify({ status: 'error' }));
	}
}

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
