import { CACHE_CONTROL, minioClient } from '#lib/minio.js';
import type { IPhoto } from '#lib/models/IPhoto.js';

export async function GET({ url, request }) {
	let bucket = url.searchParams.get('bucket');
	let folder = url.searchParams.get('folder');

	if (!bucket || !folder) return new Response(JSON.stringify([]));

	try {
		// объявляем один раз, до цикла
		const prefix = folder.endsWith('/') ? folder : `${folder}/`;

		const photos: IPhoto[] = [];

		for await (const obj of minioClient.listObjects(bucket, prefix, true)) {
			const ext = obj.name.split('.').pop()?.toLowerCase() ?? '';
			if (!['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'heic'].includes(ext)) {
				continue;
			}

			// только файлы непосредственно в папке, без подпапок
			if (obj.name.replace(prefix, '').includes('/')) continue;

			const url = new URL('/api/image', request.url);
			url.searchParams.set('bucket', bucket);
			url.searchParams.set('name', obj.name);

			photos.push({ name: obj.name, url: url.toString() });
		}

		return new Response(JSON.stringify(photos));
	} catch (error) {
		return new Response(JSON.stringify([]));
	}
}

export async function POST({ request }) {
	let { bucket, folder, photos } = await request.json();

	try {
		if (!photos || !(photos[0] instanceof Blob))
			return new Response(JSON.stringify({ status: 'error' }));

		for (const f of photos) {
			const file = f as Blob & { name: string; type: string };
			const ext = file.name.split('.').pop()?.toLowerCase() || 'bin';
			const key = `${crypto.randomUUID()}.${ext}`;

			let buffer = Buffer.from(await file.arrayBuffer());
			await minioClient.putObject(bucket, `${folder}/${key}`, buffer, file.size, {
				'Content-Type': file.type,
				'Cache-Control': CACHE_CONTROL
			});
		}
		return new Response(JSON.stringify({ status: 'ok' }));
	} catch (error) {
		return new Response(JSON.stringify({ status: 'error' }));
	}
}

export async function DELETE({ request }) {
	let { bucket, photo } = await request.json();

	try {
		await minioClient.removeObject(bucket, photo);
		return new Response(JSON.stringify({ status: 'ok' }));
	} catch (error) {
		return new Response(JSON.stringify({ status: 'error' }));
	}
}
