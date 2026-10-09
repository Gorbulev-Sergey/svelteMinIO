import type { Snippet } from 'svelte';

interface IStore {
	title: Snippet<[]> | null;
}

export let store = $state<IStore>({
	title: null
});
