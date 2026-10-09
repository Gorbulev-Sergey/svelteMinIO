<script lang="ts">
	import Block from '$lib/components/Block.svelte';
	import Column from '$lib/components/Column.svelte';
	import { getBuckets, getFolders, getPhotos } from '$lib/data.remote';
	import { store } from '$lib/store.svelte';

	let buckets = $derived(await getBuckets());
	let selectedBucket = $derived(buckets[0]);
	let folders = $derived(await getFolders(selectedBucket?.name));
	let selectedFolder = $derived(folders ? folders[0] : '');
	let photos = $derived(await getPhotos({ bucket: selectedBucket?.name, folder: selectedFolder }));
	let selectedPhoto = $derived(photos ? photos[0] : { url: '', name: '' });

	store.title = title;
</script>

{#snippet title()}
	<div>Загружаем данные из <b>remote functions</b></div>
{/snippet}

<Column>
	<Block title="Путь">
		<div class="d-flex align-items-center justify-content-between w-100 gap-3">
			<div class="d-flex align-items-center gap-1">
				{#each selectedFolder.split('/') as item, i}
					{#if i == 0}
						<button
							class="btn btn-sm btn-light bg-white text-dark border-0"
							onclick={async () => (selectedFolder = folders ? folders[0] : '')}
							><b>{selectedBucket.name}:</b></button
						>
					{/if}
					<div class="d-flex align-items-end">
						<i style="font-size: .8em; padding-top:.2em" class="fa-solid fa-angle-right"></i>
					</div>
					<button
						class="btn btn-sm btn-light text-dark px-1 py-0"
						onclick={async () => {
							selectedFolder = selectedFolder
								.split('/')
								.slice(0, i + 1)
								.join('/');
							await getPhotos({
								bucket: selectedBucket?.name,
								folder: selectedFolder
							}).refresh();
						}}>{item}</button
					>
				{/each}
			</div>
		</div>
	</Block>
	<Block>
		<h4>Баккеты</h4>
		<div class="d-flex align-items-center gap-2">
			{#each buckets as bucket}
				<button
					class="btn btn-sm {selectedBucket.name === bucket.name
						? 'btn-dark text-light'
						: 'btn-light text-dark'} text-nowrap"
					onclick={() => {
						selectedBucket = bucket;
					}}
				>
					{bucket.name}
				</button>
			{/each}
		</div>
	</Block>

	<Block>
		<h4>Папки</h4>
		<div class="d-flex align-items-center gap-2 flex-wrap">
			{#each folders as folder}
				<button
					class="btn btn-sm {selectedFolder === folder
						? 'btn-dark text-light'
						: 'btn-light text-dark'} text-nowrap"
					onclick={() => {
						selectedFolder = folder;
					}}
				>
					{folder}
				</button>
			{/each}
		</div>
	</Block>

	<Block>
		<h4>Фотографии</h4>
		<div class="row row-cols-1 row-cols-md-4 g-2 w-100 mx-auto">
			{#each photos as photo}
				<div class="col">
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div
						class="d-flex flex-column {selectedPhoto.url === photo.url
							? 'bg-dark'
							: 'bg-secondary bg-opacity-10'}   rounded"
						style="padding:3.5px"
						onclick={() => (selectedPhoto = photo)}
					>
						<div
							class="h-100 rounded position-relative"
							style="background-image: url({photo.url}); background-repeat: no-repeat; background-position: center; background-size: cover; min-height:13em; cursor:pointer"
						></div>
					</div>
				</div>
			{/each}
		</div>
	</Block>
</Column>
