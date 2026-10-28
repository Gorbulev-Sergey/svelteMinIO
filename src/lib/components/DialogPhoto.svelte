<script lang="ts">
	import { getPhotoEXIF } from '#lib/minio.remote';
	import type { IPhoto } from '#lib/models/IPhoto';
	import { onMount, type Snippet } from 'svelte';

	interface IProps {
		photo?: IPhoto;
		photos?: IPhoto[];
		children?: Snippet<[]>;
		isShow?: boolean;
		onCancel?: () => void;
	}
	let { photo, photos, children, isShow = $bindable(false), onCancel = () => {} }: IProps = $props();

	let id = crypto.randomUUID();
	let dialog = $derived(document.getElementById(id) as HTMLDialogElement);
	let exif = $derived(photo?.url && photo.url.trim() !== '' ? await getPhotoEXIF(photo.url) : undefined);

	$effect(() => {
		if (isShow) dialog.showModal();
		else dialog.close();
	});

	onMount(async () => {
		document.addEventListener('keydown', e => {
			if (e.key !== 'Escape') return;
			isShow = false;
		});
		document.addEventListener('wheel', e => {
			if (photo && photos && photos.length > 0) {
				let index = photos.indexOf(photo);
				if (e.deltaY > 0) {
					index = photos.indexOf(photo) < photos.length - 1 ? photos.indexOf(photo) + 1 : 0;
				} else if (e.deltaY < 0) {
					index = photos.indexOf(photo) > 0 ? photos.indexOf(photo) - 1 : photos.length - 1;
				}
				photo = photos[index];
			}
		});
	});
</script>

<dialog
	{id}
	class="my-dialog dialog-fullscreen border-0 p-0 bg-transparent">
	<div
		class="position-relative img-fluid h-100"
		style="background-image: url({photo?.url}); background-repeat: no-repeat; background-position: center; background-size: contain;">
		{#if children}
			{@render children?.()}
		{/if}
		{#if exif}
			<div class="position-absolute d-flex justify-content-center w-100 bottom-0">
				<div
					class="d-flex flex-column gap-0 theme-inverse bg-body bg-50 rounded-3 mb-3 p-5 flex-wrap"
					style="max-height: 20em;">
					{#if exif.Model}
						<div class="text-light">Камера: <b>{exif.Model}</b></div>
					{/if}
					{#if exif.LensModel}
						<div class="text-light">
							Объектив: <b>{exif.LensModel}</b>
						</div>
					{/if}
					{#if exif.FocalLength}
						<div class="text-light">
							Фокусное расстояние: <b>{exif.FocalLength} мм</b>
						</div>
					{/if}
					{#if exif.FNumber}
						<div class="text-light">
							Диафрагма: <b>{exif.FNumber}</b>
						</div>
					{/if}
					{#if exif.ISO}
						<div class="text-light">
							ISO: <b>{exif.ISO}</b>
						</div>
					{/if}
					{#if exif.ExposureMode}
						<div class="text-light">
							Экспозиция: <b>{exif.ExposureMode}</b>
						</div>
					{/if}
					{#if exif.WhiteBalance}
						<div class="text-light">
							Баланс белого: <b>{exif.WhiteBalance}</b>
						</div>
					{/if}
					{#if exif.ExifImageHeight}
						<div class="text-light">
							Разрешение: <b>{exif.ExifImageWidth}*{exif.ExifImageHeight} пикселей</b>
						</div>
					{/if}
					{#if exif.Artist}
						<div class="text-light">
							Автор: <b>{exif.Artist}</b>
						</div>
					{/if}
					{#if exif.DateTime}
						<div class="text-light">
							Дата: <b>{exif.DateTime}</b>
						</div>
					{/if}
				</div>
			</div>
		{/if}

		<button
			aria-label="Закрыть"
			class="btn btn-sm bg-body bg-20 p-1 position-absolute rounded-3"
			style="top:.375rem; right:.375rem;"
			onclick={e => {
				e.stopPropagation();
				isShow = false;
				onCancel();
			}}>
			<i class="bi bi-x-lg"></i>
		</button>
	</div>
</dialog>

<style>
	.my-dialog::backdrop {
		background: #212529f0;
		backdrop-filter: blur(1em);
	}
</style>
