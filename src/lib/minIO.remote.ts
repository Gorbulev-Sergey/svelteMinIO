import { command, query } from '$app/server';
import { minioClient } from '$lib/minio';
import * as v from 'valibot';

const folderSchema = v.object({
	bucket: v.string(),
	folder: v.string()
});

const photoSchema = v.object({
	bucket: v.optional(v.string()),
	folder: v.optional(v.string())
});

export const getBuckets = query(async () => {
	return minioClient.listBuckets();
});

export const addBucket = command(v.string(), async (bucket) => {
	if (await minioClient.bucketExists(bucket)) return;

	await minioClient.makeBucket(bucket);
});

export const deleteBucket = command(v.string(), async (bucket) => {
	// Удаляем содержимое бакета
	const objectsStream = minioClient.listObjects(bucket, '', true);
	for await (const obj of objectsStream) {
		if (obj.isDir) continue;
		await minioClient.removeObject(bucket, obj.name);
	}

	// Удаляем сам бакет
	await minioClient.removeBucket(bucket);
});

export const getFolders = query(v.optional(v.string()), async (bucket) => {
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
});

export const addFolder = command(folderSchema, async (data) => {
	if (data.bucket.trim() === '' && data.folder.trim() === '') return;

	// folder должен быть без начального слэша, например 'images/2024'
	const objectName = data.folder.endsWith('/') ? data.folder : data.folder + '/';

	await minioClient.putObject(
		data.bucket,
		objectName,
		Buffer.alloc(0), // пустой буфер
		0 // длина
	);
});

export const getPhotos = query(photoSchema, async (data) => {
	if (data.bucket && data.folder) {
		const objects = await minioClient.listObjects(data.bucket, data.folder, true);

		const images: Array<{ name: string; url: string }> = [];

		for await (const objInfo of objects) {
			// берём только файлы с расширениями картинок
			const ext = objInfo.name.split('.').pop()?.toLowerCase();
			if (!['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'heic'].includes(ext ?? '')) {
				continue;
			}

			// генерируем presigned URL — он будет работать даже без публичного бакета
			const presignedUrl = await minioClient.presignedGetObject(
				data.bucket,
				objInfo.name,
				24 * 60 * 60
			);

			if (!objInfo.name.replace(data.folder + '/', '').includes('/')) {
				images.push({
					name: objInfo.name,
					url: presignedUrl
				});
			}
		}

		return images;
	}
});
