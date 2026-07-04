<script lang="ts">
	import Block from '$lib/components/Block.svelte';

	interface IPhoto {
		name: string;
		url: string;
	}
	let folders1 = $state<string[]>([]);
	let photos = $state<IPhoto[]>([]);

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
			onclick={async () => await getPhotos(folders1[0] || 'f')}
			>Получить фото из первой папки</button
		>
	</div>
	<form class="d-flex mt-2 gap-2" method="POST" action="/api/minio" enctype="multipart/form-data">
		<input class="form-control" type="file" name="file" />
		<button class="btn btn-dark text-light" type="submit">Загрузить</button>
	</form>
</Block>

{#if folders1?.length > 0}
	<Block title="Папки" _class="mt-3">
		<div class="d-flex flex-wrap align-items-start gap-2">
			{#each folders1 as item}
				<div>{item},</div>
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
