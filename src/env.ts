import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	MINIO_LOGIN: { public: false },
	MINIO_PASSWORD: { public: false }
});
