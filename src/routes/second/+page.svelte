<script lang="ts">
	import Block from '#lib/components/Block.svelte';
	import Column from '#lib/components/Column.svelte';
	import Dialog from '#lib/components/Dialog.svelte';
	import DialogPhoto from '#lib/components/DialogPhoto.svelte';
	import Title from '#lib/components/Title.svelte';
	import {
		addBucket,
		addFolder,
		addPhotos,
		deleteBucket,
		deleteFolder,
		deletePhoto,
		getBuckets,
		getFolders,
		getPhotos
	} from '#lib/minio.remote';
	import { store } from '#lib/store.svelte';

	let buckets = $derived(await getBuckets());
	let selectedBucket = $derived(buckets[0]);
	let folders = $derived((await getFolders(selectedBucket?.name)) || []);
	let selectedFolder = $derived(folders ? folders[0] : '');
	let photos = $derived(await getPhotos({ bucket: selectedBucket?.name, folder: selectedFolder }));
	let selectedPhoto = $derived(photos ? photos[0] : { url: '', name: '' });

	let files = $state<null | FileList>();
	let inputFiles = $state<HTMLInputElement>();

	let isModalShow = $state({
		bucket: { add: false, delete: false },
		folder: { add: false, delete: false },
		photo: { add: false, delete: false, fullScreen: false }
	});

	let newObject = $state({
		bucket: '',
		folder: '',
		photo: ''
	});

	store.title = title;
</script>

{#snippet title()}
	<div>Загружаем данные из <b>remote functions</b></div>
{/snippet}

<Column>
	<Block title="Путь">
		<div class="d-flex align-items-center justify-content-between w-100 gap-3">
			<div class="d-flex align-items-center gap-1">
				{#each selectedFolder?.split('/') as item, i}
					{#if i == 0}
						<button
							class="btn btn-sm btn-light bg-white text-dark border-0"
							onclick={async () => (selectedFolder = folders ? folders[0] : '')}><b>{selectedBucket.name}:</b></button>
					{/if}
					<div class="d-flex align-items-end">
						<i
							style="font-size: .8em; padding-top:.2em"
							class="fa-solid fa-angle-right"></i>
					</div>
					<button
						class="btn btn-sm btn-light text-dark px-1 py-0"
						onclick={async () => {
							selectedFolder = selectedFolder
								?.split('/')
								?.slice(0, i + 1)
								?.join('/');
							await getPhotos({
								bucket: selectedBucket?.name,
								folder: selectedFolder
							}).refresh();
						}}>{item}</button>
				{/each}
			</div>
		</div>
	</Block>

	<Block>
		<Title title="Баккеты">
			<button
				class="btn btn-sm btn-dark text-light"
				onclick={() => (isModalShow.bucket.add = true)}>Добавить</button>
		</Title>
		<div class="d-flex align-items-center gap-2">
			{#each buckets as bucket}
				<div class="d-flex align-items-center">
					<button
						class="btn btn-sm {selectedBucket.name === bucket.name
							? 'btn-dark text-light'
							: 'btn-light text-dark'} text-nowrap rounded-end-0"
						onclick={() => {
							selectedBucket = bucket;
						}}>
						{bucket.name}
					</button>
					<button
						title="Удалить бакет"
						class="btn btn-sm {selectedBucket.name === bucket.name
							? 'btn-dark'
							: 'btn-light'} text-danger text-nowrap rounded-start-0"
						onclick={() => {
							selectedBucket = bucket;
							isModalShow.bucket.delete = true;
						}}>
						<i class="fa-solid fa-xmark"></i>
					</button>
				</div>
			{/each}
		</div>
	</Block>

	<Block>
		<Title title="Папки">
			<button
				class="btn btn-sm btn-dark text-light"
				onclick={() => (isModalShow.folder.add = true)}>Добавить</button>
		</Title>
		<div class="d-flex align-items-center gap-2 flex-wrap">
			{#each folders as folder}
				<div class="d-flex align-items-center">
					<button
						class="btn btn-sm {selectedFolder === folder
							? 'btn-dark text-light'
							: 'btn-light text-dark'} text-nowrap rounded-end-0"
						onclick={() => {
							selectedFolder = folder;
						}}>
						{folder}
					</button>
					<button
						title="Удалить бакет"
						class="btn btn-sm {selectedFolder === folder
							? 'btn-dark'
							: 'btn-light'} text-danger text-nowrap rounded-start-0"
						onclick={() => {
							selectedFolder = folder;
							isModalShow.folder.delete = true;
						}}>
						<i class="fa-solid fa-xmark"></i>
					</button>
				</div>
			{/each}
		</div>
	</Block>

	<Block>
		<Title title="Фотографии">
			<input
				hidden
				class="form-control"
				type="file"
				name="files"
				multiple
				bind:this={inputFiles}
				onchange={async (e: Event) => {
					const t = e.target as HTMLInputElement;
					if (t.files && t.files.length > 0) {
						const blobs = Array.from(t.files as FileList).map(f => f as Blob);
						isModalShow.photo.add = true;
						await addPhotos({ bucket: selectedBucket.name, folder: selectedFolder, photos: blobs });
						isModalShow.photo.add = false;
						await getPhotos({ bucket: selectedBucket.name, folder: selectedFolder }).refresh();
					}
				}} />
			<button
				class="btn btn-sm btn-dark text-light"
				onclick={() => inputFiles?.click()}>{isModalShow.photo.add ? 'Загрузка...' : 'Добавить'}</button>
		</Title>
		<div class="row row-cols-1 row-cols-md-4 g-2 w-100 mx-auto">
			{#each photos as photo}
				<div class="col">
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<!-- svelte-ignore a11y_mouse_events_have_key_events -->
					<div
						class="d-flex flex-column {selectedPhoto.url === photo.url
							? 'bg-dark'
							: 'bg-secondary bg-opacity-10'} rounded"
						style="padding: .1em;"
						onmouseover={() => (selectedPhoto = photo)}>
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<div
							class="h-100 rounded-1 position-relative w-100 d-flex align-items-start justify-content-end"
							style="background-image: url({photo.url}); background-repeat: no-repeat; background-position: center; background-size: cover; min-height:11.5em; cursor:pointer"
							onclick={() => (isModalShow.photo.fullScreen = true)}>
							<button
								title="Удалить фото"
								class="btn btn-sm btn-danger bg-light m-1 p-1 bg-opacity-10 border-0"
								onclick={async e => {
									e.stopPropagation();
									isModalShow.photo.delete = true;
								}}>
								<i class="fa-solid fa-xmark text-danger"></i>
							</button>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</Block>
</Column>

<Dialog
	title="Добавить <b>{newObject.bucket}</b> бакет?"
	bind:isShow={isModalShow.bucket.add}
	buttonOkTitle="Добавить"
	onOk={async () => {
		if (newObject.bucket.trim() != '') {
			await addBucket(newObject.bucket);
			await getBuckets().refresh();
			isModalShow.bucket.add = false;
			newObject.bucket = '';
		}
	}}
	onCancel={() => {
		newObject.bucket = '';
	}}
	autoCloseOnOk={false}>
	<div class="bg-info text-dark bg-opacity-10 rounded-1 px-3 py-2">
		Название бакета должно содержать только латинские буквы!
	</div>
	<input
		class="form-control"
		placeholder="Название бакета"
		bind:value={newObject.bucket} />
</Dialog>

<Dialog
	title="Удалить бакет {selectedBucket.name}?"
	bind:isShow={isModalShow.bucket.delete}
	buttonOkTitle="Удалить"
	onOk={async () => {
		if (selectedBucket.name === newObject.bucket) {
			await deleteBucket(newObject.bucket);
			await getBuckets().refresh();
			isModalShow.bucket.delete = false;
			newObject.bucket = '';
		}
	}}
	onCancel={() => {
		newObject.bucket = '';
	}}
	autoCloseOnOk={false}>
	<div class="d-flex flex-column justify-content-center gap-1 bg-danger text-danger bg-opacity-10 rounded-1 px-3 py-2">
		{#if folders.length > 0}
			<div>Бакет <b>{selectedBucket.name}</b> не пустой!</div>
		{/if}
		<div>Вы точно хотите удалить этот бакет?</div>
		<div>
			Для удаления бакета <b class="bg-danger text-light px-1 rounded-1 text-nowrap">{selectedBucket.name}</b> введите его
			название!
		</div>
	</div>

	<input
		class="form-control"
		placeholder="Название бакета"
		bind:value={newObject.bucket} />
</Dialog>

<Dialog
	title="Добавить <b>{newObject.folder}</b> папку?"
	bind:isShow={isModalShow.folder.add}
	buttonOkTitle="Добавить"
	onOk={async () => {
		if (newObject.folder.trim() !== '') {
			await addFolder({ bucket: selectedBucket.name, folder: newObject.folder });
			await getFolders(selectedBucket.name).refresh();
			isModalShow.folder.add = false;
			newObject.folder = '';
		}
	}}
	onCancel={() => {
		newObject.folder = '';
	}}
	autoCloseOnOk={false}>
	<input
		class="form-control"
		placeholder="Название папки"
		bind:value={newObject.folder} />
</Dialog>

<Dialog
	title="Удалить папку {selectedFolder}?"
	bind:isShow={isModalShow.folder.delete}
	buttonOkTitle="Удалить"
	onOk={async () => {
		if (selectedFolder === newObject.folder) {
			await deleteFolder({ bucket: selectedBucket.name, folder: newObject.folder });
			await getFolders(selectedBucket.name).refresh();
			isModalShow.folder.delete = false;
			newObject.folder = '';
		}
	}}
	onCancel={() => {
		newObject.folder = '';
	}}
	autoCloseOnOk={false}>
	<div class="d-flex flex-column justify-content-center gap-1 bg-danger text-danger bg-opacity-10 rounded-1 p-3">
		{#if photos && photos.length > 0}
			<div>Папка <b>{selectedFolder}</b> не пустая!</div>
		{/if}
		<div>Вы точно хотите удалить эту папку?</div>
		<div>
			Для удаления паки <b class="bg-danger text-light px-1 rounded-1 text-nowrap">{selectedFolder}</b> введите её название!
		</div>
	</div>

	<input
		class="form-control"
		placeholder="Название папки"
		bind:value={newObject.folder} />
</Dialog>

<Dialog
	title="Удалить фото?"
	bind:isShow={isModalShow.photo.delete}
	buttonOkTitle="Удалить"
	onOk={async () => {
		await deletePhoto({
			bucket: selectedBucket.name,
			photo: selectedPhoto.name
		});
		await getPhotos({ bucket: selectedBucket.name, folder: selectedFolder }).refresh();
		isModalShow.photo.delete = false;
		newObject.photo = '';
	}}
	onCancel={() => {
		newObject.folder = '';
	}}
	autoCloseOnOk={false}>
	<div class="d-flex flex-column justify-content-center gap-1 bg-danger text-danger bg-opacity-10 rounded-1 p-3">
		<div>Вы точно хотите удалить это фото?</div>
	</div>
	<div
		class="h-100 rounded position-relative w-100 d-flex align-items-start justify-content-end"
		style="background-image: url({selectedPhoto.url}); background-repeat: no-repeat; background-position: center; background-size: cover; min-height:13em; cursor:pointer">
	</div>
</Dialog>

<DialogPhoto
	bind:isShow={isModalShow.photo.fullScreen}
	photo={selectedPhoto}></DialogPhoto>
