import { CACHE_CONTROL, minioClient } from '#lib/minio.ts';
import { error } from '@sveltejs/kit';

const MIME: Record<string, string> = {
	jpg: 'image/jpeg',
	jpeg: 'image/jpeg',
	png: 'image/png',
	gif: 'image/gif',
	webp: 'image/webp',
	svg: 'image/svg+xml',
	avif: 'image/avif'
};

// Отдаёт готовый кэшированный файл
export const GET = async ({ request, setHeaders, url }) => {
	const bucket = url.searchParams.get('bucket') || '';
	const key = url.searchParams.get('name') || '';

	if (!key) throw error(400, 'Missing key');

	try {
		const stat = await minioClient.statObject(bucket, key);

		// Если версия объекта не изменилась (тот же ETag), экономим трафик: 304 без тела
		if (request.headers.get('if-none-match') === `"${stat.etag}"`) {
			setHeaders({
				'Cache-Control': CACHE_CONTROL,
				ETag: `"${stat.etag}"`
			});
			return new Response(null, { status: 304 });
		}

		const stream = await minioClient.getObject(bucket, key);
		const ext = key.split('.').pop()?.toLowerCase() ?? '';

		return new Response(stream as unknown as ReadableStream, {
			headers: {
				'Cache-Control': CACHE_CONTROL,
				'Content-Type': MIME[ext] ?? 'application/octet-stream',
				'Content-Length': String(stat.size),
				ETag: `"${stat.etag}"`
			}
		});
	} catch {
		throw error(404, 'Not found');
	}
};
