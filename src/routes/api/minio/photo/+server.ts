import { minioClient } from '$lib/minio';
import { json } from '@sveltejs/kit';

export async function GET({ url }) {
	// читаем префикс из query-параметра, например ?prefix=images
	const prefix = url.searchParams.get('prefix') || '';
	const bucket = 'first';

	try {
		const objects = await minioClient.listObjects(bucket, prefix, true);
		const images: Array<{ name: string; url: string }> = [];

		for await (const objInfo of objects) {
			// берём только файлы с расширениями картинок
			const ext = objInfo.name.split('.').pop()?.toLowerCase();
			if (!['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif'].includes(ext ?? '')) {
				continue;
			}

			// генерируем presigned URL — он будет работать даже без публичного бакета
			const presignedUrl = await minioClient.presignedGetObject(bucket, objInfo.name, 24 * 60 * 60);

			images.push({
				name: objInfo.name,
				url: presignedUrl
			});
		}

		return json({ images });
	} catch (err) {
		console.error(err);
		return new Response(JSON.stringify({ error: 'Failed to list images' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
}
