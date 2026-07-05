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
	const formData = await request.formData();
	const filePart = formData.get('file');
	const folder = formData.get('folder');

	if (!filePart || !(filePart instanceof Blob)) {
		return new Response(JSON.stringify({ error: 'No file provided' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const file = filePart as Blob & { name: string; type: string };
	const buffer = Buffer.from(await file.arrayBuffer());

	await minioClient.putObject('first', `/${folder}/${file.name}`, buffer, buffer.length, {
		'Content-Type': file.type
	});

	return new Response(JSON.stringify({ ok: true, name: file.name }));
}
