import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	ID_tenanta: { public: false },
	ID: { public: false },
	key: { public: false },
	endpoint: { public: false },
	region: { public: false }
});
