import { minioClient } from '#lib/minio.ts';
import { message } from 'valibot';

export async function GET() {
	try {
		return new Response(JSON.stringify(await minioClient.listBuckets()));
	} catch (error) {
		return new Response(JSON.stringify([]));
	}
}

export async function POST({ request }) {
	let { bucket } = await request.json();

	if (bucket.trim() == '')
		return new Response(JSON.stringify({ status: 'error', message: 'Неверное название бакета!' }));
	if (await minioClient.bucketExists(bucket))
		return new Response(
			JSON.stringify({ status: 'error', message: 'Бакет с таким именем уже сужествует!' })
		);

	try {
		await minioClient.makeBucket(bucket.toLowerCase());
		return new Response(JSON.stringify({ status: 'ok' }));
	} catch (error) {
		return new Response(JSON.stringify({ status: 'error', message: 'Ошибка создания бакета!' }));
	}
}
