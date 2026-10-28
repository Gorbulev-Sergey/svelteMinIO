<script lang="ts">
	import Block from '#lib/components/Block.svelte';
	import Column from '#lib/components/Column.svelte';
	import Dialog from '#lib/components/Dialog.svelte';
	import DialogPhoto from '#lib/components/DialogPhoto.svelte';
	import Subtitle from '#lib/components/Subtitle.svelte';
	import {
		addBucket,
		addFolder,
		addPhotos,
		deleteBucket,
		deleteFolder,
		deletePhoto,
		downloadBucket,
		getBuckets,
		getFolders,
		getPhotos
	} from '#lib/minio.remote';
	import { store } from '#lib/store.svelte';
	import { toast } from '@gorbulevsv/toasts';

	let buckets = $derived(await getBuckets());
	let selectedBucket = $derived(buckets[0]);
	let folders = $derived((await getFolders(selectedBucket?.name)) || []);
	let selectedFolder = $derived(folders ? folders[0] : '');
	let photos = $derived(await getPhotos({ bucket: selectedBucket?.name, folder: selectedFolder }));
	let selectedPhoto = $derived(photos && photos.length > 0 ? photos[0] : { url: '', name: '' });

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
	<div><b>Новый макет</b></div>
{/snippet}

<Column>
	<Block>
		<Column gap="2">
			<div class="d-flex align-items-center justify-content-between gap-2 w-100">
				<section class="d-flex align-items-center gap-0">
					{#each selectedFolder?.split('/') as item, i}
						{#if i == 0}
							<button
								class="badge rounded-3"
								onclick={async () => (selectedFolder = folders ? folders[0] : '')}>
								<b>{selectedBucket.name}:</b>
							</button>
						{/if}

						<div class="badge bg-transparent rounded-3 p-1">
							<i class="bi bi-chevron-right"></i>
						</div>

						<button
							class="badge rounded-3"
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
				</section>
				<div class="d-flex align-items-center gap-3">
					<small class="badge bg-10 rounded-3">
						в папке: <b class="text-dark">{photos?.length} фото</b>
					</small>
					<div class="d-flex align-items-center gap-1">
						<button
							class="btn btn-sm rounded-3"
							onclick={async () => await downloadBucket(selectedBucket.name)}
							>Скачать бакет <b>{selectedBucket.name}</b></button>

						<button
							class="btn btn-sm btn-solid theme-inverse rounded-3"
							type="button"
							data-bs-toggle="menu"
							data-bs-placement="bottom-end"
							aria-expanded="false">
							<div>Добавить</div>
							<i class="bi bi-chevron-expand"></i>
						</button>
						<div class="menu rounded-3 border-0">
							<button
								class="menu-item rounded-3"
								onclick={() => (isModalShow.bucket.add = true)}>Бакет</button>

							<button
								class="menu-item rounded-3"
								onclick={() => {
									isModalShow.folder.add = true;
								}}>
								Папка
							</button>
							<button
								class="menu-item rounded-3"
								onclick={() => inputFiles?.click()}>{isModalShow.photo.add ? 'Загрузка...' : 'Фотографии'}</button>
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
										await addPhotos({
											bucket: selectedBucket.name,
											folder: selectedFolder,
											photos: blobs
										});
										isModalShow.photo.add = false;
										await getPhotos({
											bucket: selectedBucket.name,
											folder: selectedFolder
										}).refresh();
									}
								}} />
						</div>
					</div>
				</div>
			</div>

			<div class="d-flex gap-2 w-100">
				<section class="d-flex flex-column gap-3">
					<section class="d-flex flex-column align-items-stretch gap-1">
						<Subtitle title="Бакеты:"></Subtitle>
						{#each buckets as bucket}
							<div class="btn-group">
								<button
									class="btn btn-sm w-100 justify-content-start rounded-start-3 {selectedBucket.name === bucket.name
										? 'btn-subtle theme-inverse fw-bold'
										: ''}"
									onclick={() => {
										selectedBucket = bucket;
									}}>
									{bucket.name}
								</button>
								<button
									title="Удалить бакет"
									class="btn btn-sm rounded-end-3 fg-danger p-1 {selectedBucket.name === bucket.name
										? 'btn-subtle theme-inverse fw-bold'
										: ''}"
									onclick={() => {
										selectedBucket = bucket;
										isModalShow.bucket.delete = true;
									}}>
									<i class="bi bi-x-lg"></i>
								</button>
							</div>
						{/each}
					</section>

					<div class="d-flex flex-column align-items-stretch gap-1">
						<Subtitle title="Папки:"></Subtitle>
						{#each folders as folder}
							<div class="btn-group">
								<button
									class="btn btn-sm w-100 justify-content-start rounded-start-3 {selectedFolder === folder
										? 'btn-subtle theme-inverse fw-bold'
										: ''}"
									onclick={() => {
										selectedFolder = folder;
									}}>
									{folder}
								</button>
								<button
									title="Удалить бакет"
									class="btn btn-sm rounded-end-3 fg-danger p-1 {selectedFolder === folder
										? 'btn-subtle theme-inverse fw-bold'
										: ''}"
									onclick={() => {
										selectedFolder = folder;
										isModalShow.folder.delete = true;
									}}>
									<i class="bi bi-x-lg"></i>
								</button>
							</div>
						{/each}
					</div>
				</section>

				<div class="flex-grow-1 w-100">
					<div class="row row-cols-1 md:row-cols-4 g-2 w-100 m-auto">
						{#each photos as photo}
							<div class="col position-relative">
								<!-- svelte-ignore a11y_click_events_have_key_events -->
								<!-- svelte-ignore a11y_no_static_element_interactions -->
								<div
									class="h-100 rounded-3 w-100 d-flex align-items-start justify-content-end hover-lift"
									style="background-image: url({photo.url}); background-repeat: no-repeat; background-position: center; background-size: cover; min-height:11.5em; cursor:pointer"
									onclick={() => {
										selectedPhoto = photo;
										isModalShow.photo.fullScreen = true;
									}}>
									<button
										title="Удалить фото"
										class="btn btn-sm bg-20 position-absolute end-0"
										onclick={async e => {
											e.stopPropagation();
											isModalShow.photo.delete = true;
										}}>
										<i class="bi bi-x-lg"></i>
									</button>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</Column>
	</Block>
</Column>

<Dialog
	title="Добавить <b>{newObject.bucket}</b> бакет?"
	bind:isShow={isModalShow.bucket.add}
	buttonOkTitle="Добавить"
	onOk={async () => {
		if (newObject.bucket.trim() != '') {
			await addBucket(newObject.bucket).then(async r => {
				if (r?.result === 'ok') {
					toast({
						title: 'Бакет добавлен',
						content: `Бакет ${newObject.bucket} успешно добавлен!`,
						_class: 'bg-success bg-10'
					});
					await getBuckets().refresh();
				} else toast({ title: 'Ошибка', content: 'Не удалось добавить бакет!', _class: 'bg-danger bg-10' });
			});
			isModalShow.bucket.add = false;
			newObject.bucket = '';
		}
	}}
	onCancel={() => {
		newObject.bucket = '';
	}}
	autoCloseOnOk={false}>
	<div class="alert theme-info border-0 rounded-3 px-3 py-2">
		Название бакета должно содержать только латинские буквы!
	</div>
	<input
		class="form-control rounded-3"
		placeholder="Название бакета"
		bind:value={newObject.bucket} />
</Dialog>

<Dialog
	title="Удалить бакет {selectedBucket.name}?"
	bind:isShow={isModalShow.bucket.delete}
	buttonOkTitle="Удалить"
	onOk={async () => {
		if (selectedBucket.name === newObject.bucket) {
			await deleteBucket(newObject.bucket).then(async r => {
				if (r.result === 'ok') {
					toast({
						title: 'Бакет удалён',
						content: `Бакет <b>${newObject.bucket}</b> удалён!`,
						_class: 'bg-success bg-10'
					});
					await getBuckets().refresh();
				} else {
					toast({ title: 'Ошибка', content: `Ошибка удаления бакета!`, _class: 'bg-danger bg-10' });
				}
			});
			isModalShow.bucket.delete = false;
			newObject.bucket = '';
		}
	}}
	onCancel={() => {
		newObject.bucket = '';
	}}
	autoCloseOnOk={false}>
	<div class="d-flex flex-column justify-content-center gap-1 alert theme-danger border-0 rounded-3">
		{#if folders.length > 0}
			<div>Бакет <b>{selectedBucket.name}</b> не пустой!</div>
		{/if}
		<div>Вы точно хотите удалить этот бакет?</div>
		<div>
			Для удаления бакета <b class="bg-danger bg-50 rounded-3 px-1 text-nowrap">{selectedBucket.name}</b> введите его название!
		</div>
	</div>

	<input
		class="form-control rounded-3"
		placeholder="Название бакета"
		bind:value={newObject.bucket} />
</Dialog>

<Dialog
	title="Добавить папку"
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
	<small>
		<b class="bg-light text-dark rounded-1">{selectedBucket.name}:</b>
		<b>{newObject.folder}</b>
	</small>
	<input
		class="form-control rounded-3"
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
	<div class="d-flex flex-column justify-content-center gap-1 alert theme-danger border-0 rounded-3 p-3">
		{#if photos && photos.length > 0}
			<div>Папка <b>{selectedFolder}</b> не пустая!</div>
		{/if}
		<div>Вы точно хотите удалить эту папку?</div>
		<div>
			Для удаления паки <b class="bg-danger bg-50 px-1 rounded-3 text-nowrap">{selectedFolder}</b> введите её название!
		</div>
	</div>

	<input
		class="form-control rounded-3"
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
	<div class="alert theme-danger border-0 rounded-3">
		<div>Вы точно хотите удалить это фото?</div>
	</div>
	<div
		class="w-100 h-100 rounded-3 position-relative d-flex align-items-start justify-content-end"
		style="background-image: url({selectedPhoto.url}); background-repeat: no-repeat; background-position: center; background-size: cover; min-height:13em; cursor:pointer">
	</div>
</Dialog>

<DialogPhoto
	bind:isShow={isModalShow.photo.fullScreen}
	photo={selectedPhoto}
	{photos}></DialogPhoto>
