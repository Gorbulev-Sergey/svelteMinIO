import { minioClient } from '#lib/minio';
import ExifReader from 'exifreader';

export async function POST({ fetch, request }) {
	const { url } = await request.json();
	const res = await fetch(url);
	const arrayBuffer = await res.arrayBuffer();

	// Синхронный парсинг буфера
	const tags = ExifReader.load(arrayBuffer, { expanded: true });
	const exif = tags?.exif;
	console.log(exif);
	return new Response(JSON.stringify(exif));
}

export async function DELETE({ request }) {
	let { bucket } = await request.json();
	let { name } = await request.json();
	try {
		await minioClient.removeObject(bucket, name);
		return new Response(JSON.stringify({ ok: true }), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ ok: false }), { status: 500 });
	}
}
