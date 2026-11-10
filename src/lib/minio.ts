import { MINIO_LOGIN, MINIO_PASSWORD } from '$app/env/private';
import { Client as MinIOClient } from 'minio';

export const minioClient = new MinIOClient({
	region: 'ru-1',
	endPoint: 's3.buckets.ru',
	port: 443,
	useSSL: true,
	accessKey: MINIO_LOGIN,
	secretKey: MINIO_PASSWORD
});

export async function createPresignedUrl(
	bucket: string,
	objectKey: string,
	expires: number = 3600
) {
	return await minioClient.presignedGetObject(bucket, objectKey, expires);
}

const cache = new Map<string, { url: string; expiresAt: number }>();
export async function getCachedPresignedUrl(bucket: string, key: string, ttlSec = 86400) {
	const cached = cache.get(key);
	// отдаём кэшированный URL, пока до истечения осталось больше минуты
	if (cached && cached.expiresAt - Date.now() > 60_000) {
		return cached.url;
	}

	const url = await minioClient.presignedGetObject(bucket, key, ttlSec);
	cache.set(key, { url, expiresAt: Date.now() + ttlSec * 1000 });
	return url;
}

export const CACHE_CONTROL = 'public, max-age=31536000, immutable';

// export const minioClient = new MinIOClient({
// 	// endPoint: '109.205.56.30', // для vps
// 	//endPoint: '192.168.0.107', // для виртуальной машины
// 	// endPoint: 'localhost', // для локальной машины,
// 	endPoint: 's3.buckets.ru',
// 	port: 443,
// 	useSSL: true,
// 	accessKey: PUBLIC_LOGIN, // замените на ваши значения
// 	secretKey: PUBLIC_PASSWORD,
// 	region: 'ru-1'
// 	// accessKey: 'minioadmin', // замените на ваши значения
// 	// secretKey: 'minioadmin'
// });
