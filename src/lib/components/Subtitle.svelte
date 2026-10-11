<script lang="ts">
	import type { Snippet } from 'svelte';

	interface IProps {
		title?: string;
		children?: Snippet<[]>;
	}
	let { title, children }: IProps = $props();
</script>

<div class="d-flex align-items-center gap-3 w-100 px-1">
	<b class="my-0">{title}</b>
	{#if children}
		<div class="flex-grow-1 d-flex align-items-center justify-content-end gap-1">
			{@render children?.()}
		</div>
	{/if}
</div>
