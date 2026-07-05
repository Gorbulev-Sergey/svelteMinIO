import { minioClient } from '$lib/minio';
import { json } from '@sveltejs/kit';

export async function GET() {
	const bucket = 'first';

	try {
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

		return json({ folders: Array.from(folders) });
	} catch (err) {
		console.error(err);
		return new Response(JSON.stringify({ error: 'Failed to list folders' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
}

export async function POST({ request }) {
	let { folder } = await request.json();

	// folder должен быть без начального слэша, например 'images/2024'
	const objectName = folder.endsWith('/') ? folder : folder + '/';

	await minioClient.putObject(
		'first',
		objectName,
		Buffer.alloc(0), // пустой буфер
		0 // длина
	);

	return new Response(JSON.stringify({ status: 'ok' }));
}
