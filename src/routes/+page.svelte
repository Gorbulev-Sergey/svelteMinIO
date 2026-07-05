<script lang="ts">
	import { enhance } from '$app/forms';
	import Block from '$lib/components/Block.svelte';
	import { onMount } from 'svelte';

	interface IPhoto {
		name: string;
		url: string;
	}
	let file = $state<null | Blob>();
	let inputFile = $state<HTMLInputElement>();
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
		use:enhance={() => {
			return async () => {
				await getPhotos(folders1[selectedFolder] || 'f');
				file = null;
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
			name="file"
			bind:value={file}
			bind:this={inputFile}
		/>
		<button type="button" class="btn btn-dark text-light" onclick={() => inputFile?.click()}
			>Добавить</button
		>
		{#if file}
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
		<div class="d-flex flex-wrap align-items-start gap-2">
			{#each photos as { name, url }}
				<img class="rounded" style="width: 24%;" src={url} alt="" />
			{/each}
		</div>
	</Block>
{/if}
