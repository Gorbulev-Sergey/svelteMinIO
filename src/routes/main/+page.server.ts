import type { BucketItemFromList } from 'minio';

export async function load({ url, fetch, setHeaders }) {
	setHeaders({
		'Cache-Control': 'public, max-age=604800',
		Vary: 'Accept-Encoding'
	});

	let buckets = (await (await fetch('/api/minio/bucket')).json()) as BucketItemFromList[];
	let bucket = url.searchParams.get('bucket') || buckets[0].name;

	let folders = await (await fetch(`/api/minio/folder?bucket=${bucket}`)).json();
	let folder = url.searchParams.get('folder') || folders[0];

	let photos = await (
		await fetch(`/api/minio/photo?bucket=${bucket}&folder=${encodeURIComponent(folder)}`)
	).json();

	return {
		buckets,
		folders,
		photos
	};
}
