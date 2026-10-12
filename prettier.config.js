/** @type {import("prettier").Config} */
const config = {
	arrowParens: 'avoid',
	singleAttributePerLine: true,
	bracketSameLine: true,
	printWidth: 120,

	useTabs: true,
	singleQuote: true,
	trailingComma: 'none',
	plugins: ['prettier-plugin-svelte'],
	overrides: [{ files: '*.svelte', options: { parser: 'svelte' } }]
};

export default config;
