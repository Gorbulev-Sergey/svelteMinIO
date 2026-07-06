<script lang="ts">
	import Block from '$lib/components/Block.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import ModalPhoto from '$lib/components/ModalPhoto.svelte';
	import Title from '$lib/components/Title.svelte';
	import exifr from 'exifr';
	import { onMount } from 'svelte';

	interface IPhoto {
		name: string;
		url: string;
	}
	interface IEXIF {
		CreateDate?: Date;
		Model?: string;
		LensModel?: string;
		ImageWidth?: number;
		ImageHeight?: number;
		FocalLength?: number;
		ISO?: number;
		ExposureTime?: number;
		WhiteBalance?: string;
	}
	let files = $state<null | FileList>();
	let inputFiles = $state<HTMLInputElement>();
	let folders1 = $state<string[]>([]);
	let photos = $state<IPhoto[]>([]);
	let selectedFolder = $state(0);
	let newFolder = $state('');
	let selectedPhoto = $state<IPhoto>();
	let selectedPhotoMeta = $state<IEXIF>();
	let isFolderCreateShow = $state(false);
	let isPhotoFullScreenShow = $state(false);
	let isDeleteFolderShow = $state(false);
	let isDeletePhotoShow = $state(false);

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
	let path = $derived(folders1[selectedFolder] || '');
	let paths = ['Остров', 'Город', 'Деревня', 'Страна'];
	let subPath1 = 'Остров/Сад/Деревья/Зелёные';
</script>

<Block title="Welcome to SvelteKit" _class="bg-opacity-10">
	<div class="d-flex align-items-center">
		{#each path.split('/') as item, i}
			<button
				class="btn btn-sm btn-light text-dark px-1 py-0"
				onclick={() => {
					selectedFolder = folders1.findIndex((f) => f == item);
					getPhotos(folders1[selectedFolder]);
				}}>{item}</button
			>
			{#if i < path.split('/').length - 1}
				<div class="d-flex align-items-end">
					<i style="font-size: .8em; padding-top:.2em" class="fa-solid fa-angle-right"></i>
				</div>
			{/if}
		{/each}
	</div>
</Block>
<Block title="Пути">
	<div class="d-flex flex-column gap-1">
		<div class="d-flex align-items-center gap-1">
			{#each paths as item, i}
				<button class="btn btn-sm btn-light text-dark">{item}</button>
			{/each}
			<div class="btn-group btn-group-sm dropdown-center">
				<button class="btn btn-sm btn-light">Поля</button>
				<button class="btn btn-light px-1 rounded-end" data-bs-toggle="dropdown" aria-label="">
					<i class="fa-solid fa-angles-down"></i>
				</button>
				<ul class="dropdown-menu border-0 shadow-sm py-1">
					{#each subPath1.split('/') as sub}
						<li><a class="dropdown-item small" href="/">{sub}</a></li>
					{/each}
				</ul>
			</div>
		</div>
	</div>
</Block>

<Block _class="mt-3">
	<Title title="Папки">
		<button
			type="button"
			class="btn btn-sm btn-danger text-light"
			onclick={() => {
				isDeleteFolderShow = true;
			}}>Удалить</button
		>
		<button
			type="button"
			class="btn btn-sm btn-dark text-light"
			onclick={async () => {
				isFolderCreateShow = true;
			}}>Добавить</button
		>
	</Title>
	<div class="d-flex flex-wrap align-items-start gap-1">
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

<Block _class="mt-3">
	<Title title="Фотографии">
		<input
			hidden
			class="form-control"
			type="file"
			name="files"
			multiple
			bind:this={inputFiles}
			onchange={(e: Event) => {
				const t = e.target as HTMLInputElement;
				if (t.files && t.files.length > 0) {
					files = t.files;
					const formData = new FormData();
					for (let item of files) {
						formData.append('files', item);
					}
					formData.append('folder', folders1[selectedFolder]);
					fetch('api/minio/photo', {
						method: 'POST',
						body: formData
					}).then((r) => {
						getPhotos(folders1[selectedFolder]);
					});
				}
			}}
		/>
		<button
			type="button"
			class="btn btn-sm btn-dark text-light"
			onclick={() => {
				inputFiles?.click();
			}}>Добавить</button
		>
	</Title>
	<div class="row row-cols-1 row-cols-md-4 g-2 w-100 mx-auto">
		{#each photos as { name, url }}
			<div class="col">
				<div class="d-flex flex-column bg-secondary bg-opacity-10 rounded" style="padding:3.5px">
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div
						class="h-100 rounded position-relative"
						style="background-image: url({url}); background-repeat: no-repeat; background-position: center; background-size: cover; min-height:13em; cursor:pointer"
						onclick={async () => {
							selectedPhoto = photos.find((pf) => pf.url == url);
							isPhotoFullScreenShow = true;

							const res = await fetch(url);
							if (!res.ok) throw new Error('Не удалось скачать файл');
							const blob = await res.blob();
							selectedPhotoMeta = await exifr.parse(blob);
							console.log($state.snapshot(selectedPhotoMeta));
						}}
					>
						<button
							title=""
							class="badge bg-light bg-opacity-25 text-light position-absolute border-0 p-1"
							style="right: .3em; top: .3em"
							onclick={(e) => {
								e.stopPropagation();
								selectedPhoto = photos.find((pf) => pf.url == url);
								isDeletePhotoShow = true;
							}}
						>
							<i class="fa-solid fa-trash text-danger"></i>
						</button>
					</div>
					<div class="small px-1 text-center">
						{name.length < 30
							? name.replace(folders1[selectedFolder] + '/', '')
							: name.replace(folders1[selectedFolder] + '/', '').slice(0, 30) + '...'}
					</div>
				</div>
			</div>
		{/each}
	</div>
</Block>

<Modal
	title="Добавить папку?"
	bind:isShow={isFolderCreateShow}
	onOkTitle="Добавить"
	onOk={() => {
		fetch('api/minio/folder', {
			method: 'POST',
			headers: {
				'content-type': 'application/json'
			},
			body: JSON.stringify({
				folder: newFolder
			})
		}).then((r) => {
			getFolders().then(() => {
				selectedFolder = folders1.findIndex((v) => v == newFolder);
				getPhotos(folders1[selectedFolder]).then(() => (newFolder = ''));
			});
		});
	}}
>
	<input class="form-control" placeholder="Название папки" type="text" bind:value={newFolder} />
</Modal>

<ModalPhoto bind:isShow={isPhotoFullScreenShow} _class="">
	<img class="rounded" style="max-height: 98vh;" src={selectedPhoto?.url} alt="" />
	<div
		class="bg-light text-dark bg-opacity-50 p-2 rounded position-absolute"
		style="bottom: .7em; right:.7em; max-width: 40%;"
	>
		<div class="d-flex flex-column justify-content-end overflow-hidden">
			<small><b>Hазвание:</b> {selectedPhoto?.name}</small>
			<small
				><b>Url:</b>
				<a href={selectedPhoto?.url} target="_blank">{selectedPhoto?.url.slice(0, 45)}...</a></small
			>
			<small
				><b>Дата:</b>
				{new Date(selectedPhotoMeta?.CreateDate || '').toLocaleDateString('ru-Ru', {
					day: 'numeric',
					month: 'long',
					year: 'numeric'
				})}
			</small>
			<hr class="my-1" />
			<small><b>Камера:</b> {selectedPhotoMeta?.Model}</small>
			<small><b>Объектив:</b> {selectedPhotoMeta?.LensModel}</small>
			{#if selectedPhotoMeta?.ImageWidth && selectedPhotoMeta?.ImageHeight}
				<small
					><b>Размер фото:</b>
					{String(selectedPhotoMeta.ImageWidth)}px*{String(selectedPhotoMeta?.ImageHeight)}
					px
				</small>
			{/if}
			<small><b>Фокусное расстояние:</b> {selectedPhotoMeta?.FocalLength}мм</small>
			<small><b>ISO:</b> {selectedPhotoMeta?.ISO}</small>
			<small><b>Выдержка:</b> {selectedPhotoMeta?.ExposureTime}сек</small>
			<small><b>Баланс белого:</b> {selectedPhotoMeta?.WhiteBalance}</small>
		</div>
	</div>
</ModalPhoto>

<Modal
	title="Удалить папку?"
	bind:isShow={isDeleteFolderShow}
	onOkTitle="Удалить"
	onOk={() => {
		fetch('/api/minio/folder', {
			method: 'DELETE',
			headers: {
				'content-type': 'application/json'
			},
			body: JSON.stringify({ folder: folders1[selectedFolder] })
		}).then(async (r) => {
			selectedFolder = 0;
			await getFolders();
			await getPhotos(folders1[selectedFolder] || '');
		});
	}}
>
	<div class="text-center">
		Вы действительно хотите удалить папку <b>"{folders1[selectedFolder]}"</b>?
	</div>
</Modal>

<Modal
	title="Удалить этот файл?"
	bind:isShow={isDeletePhotoShow}
	onOkTitle="Удалить"
	onOk={() => {
		fetch('api/minio/photo/url', {
			method: 'DELETE',
			headers: {
				'content-type': 'application/json'
			},
			body: JSON.stringify({ name: selectedPhoto?.name })
		}).then((r) => {
			photos = photos.filter((ph) => ph != selectedPhoto);
			selectedPhoto = photos[0];
		});
	}}
>
	<div
		class="rounded text-center"
		style="background-image: url({selectedPhoto?.url}); background-repeat: no-repeat; background-position: center; background-size: cover; min-height:16em;"
	></div>
</Modal>
