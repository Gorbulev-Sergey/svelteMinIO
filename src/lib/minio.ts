import { PUBLIC_LOGIN, PUBLIC_PASSWORD } from '$env/static/public';
import { Client as MinIOClient } from 'minio';

export const minioClient = new MinIOClient({
	region: 'ru-1',
	endPoint: 's3.buckets.ru',
	port: 443,
	useSSL: true,
	accessKey: PUBLIC_LOGIN,
	secretKey: PUBLIC_PASSWORD
});

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
