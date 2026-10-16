import type { HandleClientError } from '@sveltejs/kit';

// Оставь пустым
export const handleClientError: HandleClientError = async () => {};

if (window !== undefined) {
	const defaultTheme = 'light';
	let theme = (await cookieStore.get('theme'))?.value;
	if (!theme) {
		cookieStore.set('theme', defaultTheme);
	}
	document.querySelector('[data-bs-theme]')?.setAttribute('data-bs-theme', theme || defaultTheme);
	import('bootstrap');
}
