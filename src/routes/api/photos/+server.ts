import { minioClient } from '#lib/minio.js';
import type { IPhoto } from '#lib/models/IPhoto.js';

export async function GET({ url, request }) {
	let bucket = url.searchParams.get('bucket');
	let folder = url.searchParams.get('folder');

	if (!bucket || !folder) return new Response(JSON.stringify([]));

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
}
