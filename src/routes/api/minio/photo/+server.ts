import { minioClient } from '$lib/minio';
import { json } from '@sveltejs/kit';
import sharp from 'sharp';

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
			if (!['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'heic'].includes(ext ?? '')) {
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

// export async function POST({ request }) {
// 	const formData = await request.formData();
// 	const filePart = formData.get('file');
// 	const folder = formData.get('folder');

// 	if (!filePart || !(filePart instanceof Blob)) {
// 		return new Response(JSON.stringify({ error: 'No file provided' }), {
// 			status: 400,
// 			headers: { 'Content-Type': 'application/json' }
// 		});
// 	}

// 	const file = filePart as Blob & { name: string; type: string };
// 	const buffer = Buffer.from(await file.arrayBuffer());

// 	await minioClient.putObject('first', `/${folder}/${file.name}`, buffer, buffer.length, {
// 		'Content-Type': file.type
// 	});

// 	return new Response(JSON.stringify({ ok: true, name: file.name }));
// }

// export async function POST({ request }) {
// 	const formData = await request.formData();
// 	const fileParts = formData.getAll('files');
// 	const folder = formData.get('folder');

// 	if (!fileParts || !(fileParts[0] instanceof Blob)) {
// 		return new Response(JSON.stringify({ error: 'No file provided' }), {
// 			status: 400,
// 			headers: { 'Content-Type': 'application/json' }
// 		});
// 	}

// 	for (const filePart of fileParts) {
// 		const file = filePart as Blob & { name: string; type: string };
// 		console.log(file.name);

// 		let buffer = Buffer.from(await file.arrayBuffer());
// 		await minioClient.putObject('first', `/${folder}/${file.name}`, buffer, file.size, {
// 			'Content-Type': file.type
// 		});
// 	}

// 	return new Response(JSON.stringify({ ok: true }));
// }

export async function POST({ request }) {
	const formData = await request.formData();
	const files = formData.getAll('files');
	const folder = formData.get('folder');

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
		await minioClient.putObject('first', `/${folder}/${file.name}`, buffer, file.size, {
			'Content-Type': file.type
		});
	}

	return new Response(JSON.stringify({ ok: true }));
}
