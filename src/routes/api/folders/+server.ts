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
