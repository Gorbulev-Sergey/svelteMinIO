import type { BucketItemFromList } from 'minio';

export async function load({ fetch }) {
	let buckets = (await (await fetch('/api/minio/bucket')).json()) as BucketItemFromList[];
	console.log(buckets);
	return {
		buckets
	};
}
