import { minioClient } from '$lib/minio';

const bucket = 'gorbulevsv-container';

export async function DELETE({ request }) {
	let { name } = await request.json();
	try {
		await minioClient.removeObject(bucket, name);
		return new Response(JSON.stringify({ ok: true }), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ ok: false }), { status: 500 });
	}
}
