import { command, query } from '$app/server';
import { minioClient } from '$lib/minIO';
import { json } from '@sveltejs/kit';
import ExifReader from 'exifreader';
import * as v from 'valibot';

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
	async (data) => {
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
			console.log(file.name);

			let buffer = Buffer.from(await file.arrayBuffer());
			await minioClient.putObject(data.bucket, `${data.folder}/${file.name}`, buffer, file.size, {
				'Content-Type': file.type
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
	const arrayBuffer = await res.arrayBuffer();

	const tags = ExifReader.load(arrayBuffer, { expanded: true });
	const exif = tags?.exif;
	return exif;
});
