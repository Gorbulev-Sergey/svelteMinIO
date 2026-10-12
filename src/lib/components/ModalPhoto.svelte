<script lang="ts">
	import { getPhotoEXIF } from '$lib/minIO.remote';
	import type { IPhoto } from '$lib/models/IPhoto';
	import { onMount, type Snippet } from 'svelte';

	interface IProps {
		photo?: IPhoto;
		photos?: IPhoto[];
		isShow?: boolean;
		onCancel?: () => void;
		children?: Snippet<[]>;
	}
	let { photo, photos, isShow = $bindable(false), onCancel = () => {}, children }: IProps = $props();

	let exif = $derived(photo?.url && photo.url.trim() !== '' ? await getPhotoEXIF(photo.url) : undefined);

	function hideScroll(isHide: boolean) {
		document.body.style.overflow = isHide ? 'hidden' : '';
	}

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
				}
				if (e.deltaY < 0) {
					index = photos.indexOf(photo) > 0 ? photos.indexOf(photo) - 1 : photos.length - 1;
				}
				photo = photos[index];
			}
		});
	});

	$effect(() => {
		hideScroll(isShow);
	});
</script>

<div
	class="modal modal-fullscreen {isShow ? 'show' : 'fade'} p-1"
	style="background-color: #212529f0; display: {isShow ? 'block' : 'none'}; backdrop-filter: blur(1em);">
	<div class="position-relative w-100 h-100">
		<div class="d-flex justify-content-center align-items-center w-100 h-100">
			<img
				class="img-fluid h-100 rounded-1"
				src={photo?.url}
				style="background-position: center; background-size: contain;"
				alt="" />
			{#if children}
				{@render children?.()}
			{/if}
		</div>
		{#if exif}
			<div class="position-fixed bottom-0 w-100 start-0 d-flex justify-content-center p-2">
				<div
					class="d-flex flex-column gap-0 bg-dark bg-opacity-25 rounded-1 mb-1 p-2 flex-wrap"
					style="max-height: 20em;">
					<div class="text-light">Камера: <b>{exif.Model}</b></div>
					<div class="text-light">
						Объектив: <b>{exif.LensModel}</b>
					</div>
					<div class="text-light">
						Фокусное расстояние: <b>{exif.FocalLength} мм</b>
					</div>
					<div class="text-light">
						Диафрагма: <b>{exif.FNumber}</b>
					</div>
					<div class="text-light">
						ISO: <b>{exif.ISO}</b>
					</div>

					<div class="text-light">
						Экспозиция: <b>{exif.ExposureMode}</b>
					</div>

					<div class="text-light">
						Баланс белого: <b>{exif.WhiteBalance}</b>
					</div>
					<div class="text-light">
						Разрешение: <b>{exif.ExifImageWidth}*{exif.ExifImageHeight} пикселей</b>
					</div>
					<div class="text-light">
						Автор: <b>{exif.Artist}</b>
					</div>
					<div class="text-light">
						Дата: <b>{exif.DateTime}</b>
					</div>
				</div>
			</div>
		{/if}

		<button
			aria-label="Закрыть"
			class="btn btn-sm btn-dark bg-light me-1 p-1 bg-opacity-10 border-0 position-fixed"
			style="top:.25rem; right:.25rem"
			onclick={e => {
				e.stopPropagation();
				isShow = false;
				onCancel();
			}}>
			<i class="fa-solid fa-xmark text-light"></i>
		</button>
	</div>
</div>
