import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	ID: { public: false },
	key: { public: false },
	endpoint: { public: false },
	region: { public: false }
});
