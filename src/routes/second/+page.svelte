<script lang="ts">
	import { getBuckets, getFolders, getPhotos } from '../data.remote';

	let buckets = $derived(await getBuckets());
	let selectedBucket = $derived(buckets[0]);
	let folders = $derived(await getFolders(selectedBucket?.name));
	let selectedFolder = $derived(folders[0]);
	let photos = $derived(await getPhotos({ bucket: selectedBucket?.name, folder: selectedFolder }));
	let selectedPhoto = $derived(photos[0]);
</script>

<h2>Баккеты</h2>
<div class="d-flex align-items-center gap-2">
	{#each buckets as bucket}
		<button
			class="btn btn-sm {selectedBucket.name === bucket.name
				? 'btn-dark text-light'
				: 'btn-light text-dark'}"
			onclick={() => {
				selectedBucket = bucket;
			}}
		>
			{bucket.name}
		</button>
	{/each}
</div>

<h2>Папки</h2>
<div class="d-flex align-items-center gap-2">
	{#each folders as folder}
		<button
			class="btn btn-sm {selectedFolder === folder ? 'btn-dark text-light' : 'btn-light text-dark'}"
			onclick={() => {
				selectedFolder = folder;
			}}
		>
			{folder}
		</button>
	{/each}
</div>

<h2>Фотографии</h2>
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
