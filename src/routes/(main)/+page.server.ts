export async function load({ fetch, url }) {
	let buckets = await (await fetch('/api/buckets')).json();

	let bucket = url.searchParams.get('bucket') || buckets[0].name || '';
	let folders = await (await fetch(`/api/folders?bucket=${bucket}`)).json();

	let folder = url.searchParams.get('folder') || folders[0] || '';
	let photos = await (await fetch(`/api/photos?bucket=${bucket}&folder=${folder}`)).json();

	console.log(
		'buckets: ',
		buckets,
		'bucket: ',
		bucket,
		'folders: ',
		folders,
		'folder: ',
		folder,
		'photos: ',
		photos
	);

	return {
		buckets,
		bucket,
		folders,
		folder,
		photos
	};
}
