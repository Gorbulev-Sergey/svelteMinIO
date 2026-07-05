<script lang="ts">
	import { enhance } from '$app/forms';
	import Block from '$lib/components/Block.svelte';
	import { onMount } from 'svelte';

	interface IPhoto {
		name: string;
		url: string;
	}
	let form = $state();
	let files = $state<null | FileList>();
	let inputFiles = $state<HTMLInputElement>();
	let folders1 = $state<string[]>([]);
	let photos = $state<IPhoto[]>([]);
	let selectedFolder = $state(0);

	async function getFolders() {
		const res = await fetch('/api/minio/folder');
		const { folders } = await res.json();
		folders1 = folders;
	}

	async function getPhotos(prefix: string) {
		photos = [];
		const res = await fetch(`/api/minio/photo?prefix=${encodeURIComponent(prefix)}`);
		const { images } = await res.json();
		photos = images;
	}

	onMount(async () => {
		await getFolders();
		await getPhotos(folders1[selectedFolder] || '');
	});
</script>

<Block title="Welcome to SvelteKit">
	<form
		bind:this={form}
		use:enhance={() => {
			return async () => {
				await getPhotos(folders1[selectedFolder] || 'f');
				files = null;
			};
		}}
		class="d-flex mt-1 gap-2"
		method="POST"
		action="/api/minio/photo"
		enctype="multipart/form-data"
	>
		<input hidden name="folder" bind:value={folders1[selectedFolder]} />
		<input
			hidden
			class="form-control"
			type="file"
			name="files"
			multiple
			bind:value={files}
			bind:this={inputFiles}
		/>
		<button type="button" class="btn btn-dark text-light" onclick={() => inputFiles?.click()}
			>Добавить</button
		>
		{#if files}
			<button class="btn btn-dark text-light" type="submit">Загрузить</button>
		{/if}
	</form>
</Block>

{#if folders1?.length > 0}
	<Block title="Папки" _class="mt-3">
		<div class="d-flex flex-wrap align-items-start gap-2">
			{#each folders1 as item}
				{#if item == folders1[selectedFolder]}
					<button class="btn btn-sm btn-dark text-light">{item}</button>
				{:else}
					<button
						class="btn btn-sm btn-light text-dark"
						onclick={async () => {
							selectedFolder = folders1.findIndex((v) => v == item);
							await getPhotos(folders1[selectedFolder]);
						}}>{item}</button
					>
				{/if}
			{/each}
		</div>
	</Block>
{/if}

{#if photos?.length > 0}
	<Block title="Фотографии" _class="mt-3">
		<div class="row row-cols-1 row-cols-md-4 g-2 w-100">
			{#each photos as { name, url }}
				<div class="col">
					<div class="d-flex flex-column">
						<div
							class="h-100 rounded"
							style="background-image: url({url}); background-repeat: no-repeat; background-position: center; background-size: cover; min-height:13em; "
						></div>
						<div class="small px-1 text-center">
							{name.replace(folders1[selectedFolder] + '/', '')}
						</div>
					</div>
				</div>
			{/each}
		</div>
	</Block>
{/if}
