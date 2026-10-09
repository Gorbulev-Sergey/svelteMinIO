<script lang="ts">
	import type { Snippet } from 'svelte';

	interface IProps {
		title?: string;
		children?: Snippet<[]>;
		_class?: string;
	}

	let { title, children, _class }: IProps = $props();
</script>

<div class={`bg-white p-3 rounded d-flex flex-column align-items-start gap-2 ${_class}`}>
	{#if title}
		<h4 class="my-0">{title}</h4>
	{/if}
	{@render children?.()}
</div>
