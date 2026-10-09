<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import RenderTitle from '$lib/components/RenderTitle.svelte';
	import { store } from '$lib/store.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="sticky-top w-100 bg-light px-3 py-2">
	<div class="d-flex align-items-center">
		<div class="d-flex align-items-center gap-2">
			<a class="btn btn-sm btn-light bg-white text-dark border-0 text-nowrap" href="/"
				>Svelte <b>MinIO</b></a
			>
			<div class="d-flex align-items-center gap-2">
				<div class="d-flex align-items-end">
					<i style="font-size: .8em;" class="fa-solid fa-angle-right"></i>
				</div>
				<div class="my-0 text-nowrap text-uppercase">
					<RenderTitle>
						{#if store.title}
							{@render store.title?.()}
						{/if}
					</RenderTitle>
				</div>
			</div>
		</div>

		<div class="d-flex align-items-center justify-content-end gap-1 w-100">
			<a class="btn btn-sm btn-light bg-light text-dark border-0" href="/">Load</a>
			<a class="btn btn-sm btn-light bg-light text-dark border-0" href="/second">Remote functions</a
			>
		</div>
	</div>
</div>
<div class="container my-3">
	{@render children()}
</div>
