<script lang="ts">
	import Block from '$lib/components/Block.svelte';

	interface IPhoto {
		name: string;
		url: string;
	}
	let folders1 = $state<string[]>([]);
	let photos = $state<IPhoto[]>([]);
	let selectedFolder = $state(0);

	async function getFolders() {
		const res = await fetch('/api/minio');
		const { folders } = await res.json();
		folders1 = folders;
		console.log(folders);
	}

	async function getPhotos(prefix: string) {
		const res = await fetch(`/api/minio/photo?prefix=${encodeURIComponent(prefix)}`);
		const { images } = await res.json();
		photos = images;
		console.log(images);
	}
</script>

<Block title="Welcome to SvelteKit">
	<div class="d-flex gap-2">
		<button class="btn btn-dark text-light" onclick={getFolders}>Получить папки</button>
		<button
			class="btn btn-dark text-light"
			onclick={async () => await getPhotos(folders1[selectedFolder] || 'f')}>Получить фото</button
		>
	</div>
	<form class="d-flex mt-2 gap-2" method="POST" action="/api/minio" enctype="multipart/form-data">
		<input hidden name="folder" bind:value={folders1[selectedFolder]} />
		<input class="form-control" type="file" name="file" />
		<button class="btn btn-dark text-light" type="submit">Загрузить</button>
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
