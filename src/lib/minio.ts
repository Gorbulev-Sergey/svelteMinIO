import { Client as MinIOClient } from 'minio';

export const minioClient = new MinIOClient({
	endPoint: '192.168.0.107', // для виртуальной машины
	//endPoint: 'localhost', // для локальной машины
	port: 9000,
	useSSL: false,
	accessKey: 'minioadmin', // замените на ваши значения
	secretKey: 'minioadmin'
});
