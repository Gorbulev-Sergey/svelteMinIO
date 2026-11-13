import { minioClient } from '#lib/minio.ts';

export async function GET() {
	try {
		return new Response(JSON.stringify(await minioClient.listBuckets()));
	} catch (error) {
		return new Response(JSON.stringify([]));
	}
}
