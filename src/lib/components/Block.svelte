<script lang="ts">
	import type { Snippet } from 'svelte';

	interface IProps {
		title?: string;
		children?: Snippet<[]>;
		_class?: string;
	}

	let { title, children, _class }: IProps = $props();
</script>

<div class={`bg-white p-3 rounded d-flex flex-column align-items-start g-2 ${_class}`}>
	<h4>{title}</h4>
	{@render children?.()}
</div>
