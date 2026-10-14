<script lang="ts">
	import 'bootstrap/dist/css/bootstrap.min.css';
	import 'bootstrap-icons/font/bootstrap-icons.min.css';
	import { page } from '$app/state';
	import favicon from '$lib/assets/favicon.svg';
	import RenderTitle from '$lib/components/RenderTitle.svelte';
	import { store } from '$lib/store.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link
		rel="icon"
		href={favicon} />
</svelte:head>

<div class="sticky-top bg-1 px-3 py-2">
	<div class="d-flex align-items-center">
		<div class="d-flex align-items-center gap-1">
			<a
				class="btn btn-sm bg-1 rounded-3 text-nowrap"
				href="/">
				Svelte <b>MinIO</b>
			</a>
			<div class="d-flex align-items-center gap-0">
				<div class="d-flex align-items-end">
					<i class="bi bi-chevron-right"></i>
				</div>
				<div class="text-nowrap text-uppercase">
					<RenderTitle>
						{#if store.title}
							<div class="btn btn-sm bg-1 rounded-3">
								{@render store.title?.()}
							</div>
						{/if}
					</RenderTitle>
				</div>
			</div>
		</div>

		<div class="d-flex align-items-center justify-content-end gap-1 w-100">
			<a
				class="btn btn-sm rounded-3 {page.url.pathname == '/dropmenu' ? 'fw-bold' : ''}"
				href="/dropmenu">Dropmenu</a>
			<a
				class="btn btn-sm rounded-3 {page.url.pathname == '/main' ? 'fw-bold' : ''}"
				href="/main">Load</a>
			<a
				class="btn btn-sm rounded-3 {page.url.pathname == '/' ? 'fw-bold' : ''}"
				href="/">New maket</a>
			<a
				class="btn btn-sm rounded-3 {page.url.pathname == '/second' ? 'fw-bold' : ''}"
				href="/second">Remote functions</a>
		</div>
	</div>
</div>
<div class="container my-3">
	{@render children()}
</div>
