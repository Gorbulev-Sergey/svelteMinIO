import type { IPhoto } from '$lib/models/IPhoto.js';
import type { BucketItemFromList } from 'minio';

export async function load({ url, fetch, setHeaders }) {
	let buckets = (await (await fetch('/api/minio/bucket')).json()) as BucketItemFromList[];
	let bucket = url.searchParams.get('bucket') || buckets[0].name;

	let res = await fetch(`/api/minio/folder?bucket=${bucket}`);
	let folders = await res.json();

	// Если в URL есть ?folder=name — грузим файлы
	let folderName = url.searchParams.get('folder') || folders[0];
	let photos: IPhoto[] = [];
	if (folderName) {
		let res1 = await fetch(
			`/api/minio/photo?bucket=${bucket}&folder=${encodeURIComponent(folderName)}`
		);

		let images = await res1.json();
		photos = images;
	}

	setHeaders({
		'Cache-Control': 'public, max-age=604800',
		Vary: 'Accept-Encoding'
	});

	return {
		buckets,
		folders,
		photos
	};
}
