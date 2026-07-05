<script lang="ts">
	import type { Snippet } from 'svelte';

	interface IProps {
		title?: string;
		actions?: Snippet<[]>;
		children?: Snippet<[]>;
		_class?: string;
	}

	let { title, actions, children, _class }: IProps = $props();
</script>

<div class={`bg-white p-3 rounded d-flex flex-column align-items-start gap-2 ${_class}`}>
	<div class="d-flex align-items-center gap-2 w-100">
		<h4>{title}</h4>
		<div class="flex-grow-1 d-flex gap-1 justify-content-end flex-wrap">
			{@render actions?.()}
		</div>
	</div>
	{@render children?.()}
</div>
