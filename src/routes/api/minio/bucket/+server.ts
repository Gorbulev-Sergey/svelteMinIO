import { minioClient } from '#lib/minio';

export async function GET() {
	let buckets = minioClient.listBuckets();
	return new Response(JSON.stringify(await buckets));
}
