import { minioClient } from '$lib/minio';
import type { BucketItemFromList } from 'minio';

export async function GET() {
	let buckets = minioClient.listBuckets();
	return new Response(JSON.stringify(await buckets));
}
