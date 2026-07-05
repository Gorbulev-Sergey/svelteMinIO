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
