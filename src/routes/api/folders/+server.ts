import { minioClient } from '#lib/minio.js';

export async function GET({ url }) {
	let bucket = url.searchParams.get('bucket');

	try {
		if (bucket) {
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

			return new Response(JSON.stringify(Array.from(folders)));
		}
	} catch (error) {
		return new Response(JSON.stringify([]));
	}
}

export async function POST({ request }) {
	let { bucket, folder } = await request.json();

	try {
		// folder должен быть без начального слэша, например 'images/2024'
		const folderName = folder.endsWith('/') ? folder : folder + '/';

		await minioClient.putObject(
			bucket,
			folderName,
			Buffer.alloc(0), // пустой буфер
			0 // длина
		);
		return new Response(JSON.stringify({ status: 'ok' }));
	} catch (error) {
		return new Response(JSON.stringify({ status: 'error' }));
	}
}

export async function DELETE({ request }) {
	let { bucket, folder } = await request.json();

	try {
		const objects = minioClient.listObjects(bucket, folder, true);
		const removeObjects = [];

		for await (const obj of objects) {
			removeObjects.push({ name: obj.name });
		}

		if (removeObjects.length != 0) await minioClient.removeObjects(bucket, removeObjects);
		return new Response(JSON.stringify({ status: 'ok' }));
	} catch (error) {
		return new Response(JSON.stringify({ status: 'error' }));
	}
}
