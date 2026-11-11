import { ID, key, region, endpoint, ID_tenanta } from '$app/env/private';
import { Client as MinIOClient } from 'minio';

export const minioClient = new MinIOClient({
	region: region,
	endPoint: endpoint,
	port: 443,
	useSSL: true,
	accessKey: `${ID_tenanta}.${ID}`,
	secretKey: key
});

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
