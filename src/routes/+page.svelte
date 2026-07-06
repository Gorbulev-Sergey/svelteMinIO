<script lang="ts">
	import { enhance } from '$app/forms';
	import Block from '$lib/components/Block.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import ModalPhoto from '$lib/components/ModalPhoto.svelte';
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
</script>

<Block title="Welcome to SvelteKit">
	<form
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
		<button
			type="button"
			class="btn btn-dark text-light"
			onclick={async () => {
				isFolderCreateShow = true;
			}}>Добавить папку</button
		>
		<button type="button" class="btn btn-dark text-light" onclick={() => inputFiles?.click()}
			>Добавить фотографии</button
		>
		{#if files}
			<button class="btn btn-dark text-light" type="submit">Загрузить</button>
		{/if}
		<button
			type="button"
			class="btn btn-danger text-light"
			onclick={() => {
				isDeleteFolderShow = true;
			}}>Удалить папку</button
		>
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
								class="badge bg-danger bg-opacity-75 text-light position-absolute border-0 p-1"
								style="right: .3em; top: .3em"
								onclick={(e) => {
									e.stopPropagation();
									selectedPhoto = photos.find((pf) => pf.url == url);
									isDeletePhotoShow = true;
								}}
							>
								<i class="fa-solid fa-trash"></i>
							</button>
						</div>
						<div class="small px-1 text-center">
							{name.replace(folders1[selectedFolder] + '/', '')}
						</div>
					</div>
				</div>
			{/each}
		</div>
	</Block>
{/if}

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
				{new Date(selectedPhotoMeta?.CreateDate).toLocaleDateString('ru-Ru', {
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

<Modal title="Удалить этот файл?" bind:isShow={isDeletePhotoShow} onOkTitle="Удалить">
	<div
		class="rounded text-center"
		style="background-image: url({selectedPhoto?.url}); background-repeat: no-repeat; background-position: center; background-size: cover; min-height:16em;"
	></div>
</Modal>
