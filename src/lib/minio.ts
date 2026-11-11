import { ID, Key, Region, Endpoint, ID_tenanta } from '$app/env/public';
import { Client as MinIOClient } from 'minio';

export const minioClient = new MinIOClient({
	endPoint: Endpoint,
	port: 443,
	useSSL: true,
	accessKey: `${ID_tenanta}.${ID}`,
	secretKey: Key,
	region: Region
});

export const CACHE_CONTROL = 'public, max-age=31536000, immutable' as const;

// Не используется, но работает
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
