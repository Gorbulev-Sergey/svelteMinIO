import { minioClient } from '$lib/minio';

export async function GET({ url }) {
	// читаем префикс из query-параметра, например ?folder=images
	const bucket = url.searchParams.get('bucket') || '';
	const folder = url.searchParams.get('folder') || '';

	try {
		const objects = await minioClient.listObjects(bucket, folder, true);

		const images: Array<{ name: string; url: string }> = [];

		for await (const objInfo of objects) {
			// берём только файлы с расширениями картинок
			const ext = objInfo.name.split('.').pop()?.toLowerCase();
			if (!['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'heic'].includes(ext ?? '')) {
				continue;
			}

			// генерируем presigned URL — он будет работать даже без публичного бакета
			const presignedUrl = await minioClient.presignedGetObject(bucket, objInfo.name, 24 * 60 * 60);

			if (!objInfo.name.replace(folder + '/', '').includes('/')) {
				images.push({
					name: objInfo.name,
					url: presignedUrl
				});
			}
		}

		return new Response(JSON.stringify(images), {
			// Кэшируем файлы
			headers: {
				'Cache-Control': 'public, max-age=604800',
				Vary: 'Accept-Encoding'
			}
		});
	} catch (err) {
		console.error(err);
		return new Response(JSON.stringify({ error: 'Failed to list images' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
}

export async function POST({ request }) {
	const formData = await request.formData();
	const bucket = formData.get('bucket') || '';
	const folder = formData.get('folder');
	const files = formData.getAll('files');

	if (!files || !(files[0] instanceof Blob)) {
		return new Response(JSON.stringify({ error: 'No file provided' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	for (const f of files) {
		const file = f as Blob & { name: string; type: string };
		console.log(file.name);

		let buffer = Buffer.from(await file.arrayBuffer());
		await minioClient.putObject(bucket.toString(), `${folder}/${file.name}`, buffer, file.size, {
			'Content-Type': file.type
		});
	}

	return new Response(JSON.stringify({ ok: true }));
}
