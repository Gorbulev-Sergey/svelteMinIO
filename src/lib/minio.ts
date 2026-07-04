import { Client as MinIOClient } from 'minio';

export const minioClient = new MinIOClient({
	endPoint: 'localhost', // важно: localhost для кода на хосте
	port: 9000,
	useSSL: false,
	accessKey: 'minioadmin', // замените на ваши значения
	secretKey: 'minioadmin'
});
