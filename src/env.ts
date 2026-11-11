import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	ID: { public: true },
	Key: { public: true },
	Endpoint: { public: true },
	Region: { public: true },
	ID_tenanta: { public: true },
	Name: { public: true }
});
