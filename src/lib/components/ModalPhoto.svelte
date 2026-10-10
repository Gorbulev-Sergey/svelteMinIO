<script lang="ts">
	import { onMount } from 'svelte';

	interface IProps {
		url: string;
		isShow?: boolean;
		onCancel?: () => void;
	}
	let { url, isShow = $bindable(false), onCancel = () => {} }: IProps = $props();

	function hideScroll(isHide: boolean) {
		document.body.style.overflow = isHide ? 'hidden' : '';
	}

	$effect(() => {
		hideScroll(isShow);
	});
</script>

<div
	class="modal modal-fullscreen {isShow ? 'show' : 'fade'} bg-dark bg-opacity-75 p-1"
	style="display: {isShow ? 'block' : 'none'}; backdrop-filter: blur(.06em);"
>
	<div class="position-relative w-100 h-100">
		<div class="d-flex justify-content-center align-items-center w-100 h-100">
			<img
				class="img-fluid h-100 rounded-1"
				src={url}
				style="background-position: center; background-size: contain;"
				alt=""
			/>
		</div>
		<button
			aria-label="Закрыть"
			class="btn btn-sm btn-dark bg-dark me-1 p-1 bg-opacity-10 border-0 position-fixed"
			style="top:.25rem; right:.25rem"
			onclick={(e) => {
				e.stopPropagation();
				isShow = false;
				onCancel();
			}}
		>
			<i class="fa-solid fa-xmark text-light"></i>
		</button>
	</div>
</div>
