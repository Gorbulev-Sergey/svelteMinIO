<script lang="ts">
	import { getPhotoEXIF } from '$lib/minIO.remote';
	import { onMount, type Snippet } from 'svelte';

	interface IProps {
		url?: string;
		isShow?: boolean;
		onCancel?: () => void;
		children?: Snippet<[]>;
	}
	let { url, isShow = $bindable(false), onCancel = () => {}, children }: IProps = $props();

	let exif = $derived(url && url.trim() !== '' ? await getPhotoEXIF(url) : undefined);

	function hideScroll(isHide: boolean) {
		document.body.style.overflow = isHide ? 'hidden' : '';
	}

	onMount(async () => {
		document.addEventListener('keydown', e => {
			if (e.key !== 'Escape') return;
			isShow = false;
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
				src={url}
				style="background-position: center; background-size: contain;"
				alt="" />
			{#if children}
				{@render children?.()}
			{/if}
		</div>
		{#if exif}
			<div class="position-fixed bottom-0 w-100 start-0 d-flex justify-content-center p-2">
				<div
					class="d-flex flex-column gap-0 bg-dark bg-opacity-25 rounded-1 p-2 flex-wrap"
					style="max-height: 20em;">
					<div class="text-light">Model: <b>{JSON.stringify(exif.Model?.description)}</b></div>
					<div class="text-light">
						Lens Model: <b>{exif.LensModel?.description}</b>
					</div>
					<div class="text-light">
						Экспозиция: <b>{exif.ExposureMode?.description}</b>
					</div>
					<div class="text-light">
						Автор: <b>{exif.Artist?.description}</b>
					</div>
					<div class="text-light">
						Дата: <b>{exif.DateTime?.description}</b>
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
