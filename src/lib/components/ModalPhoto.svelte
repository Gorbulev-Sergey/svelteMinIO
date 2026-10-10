<script lang="ts">
	import type { Snippet } from 'svelte';

	interface IProps {
		title?: string;
		url: string;
		isShow?: boolean;
		_class?: string;
		onCancel?: () => void;
	}
	let { title, url, isShow = $bindable(false), _class, onCancel = () => {} }: IProps = $props();
</script>

<div
	class="modal modal-fullscreen {isShow ? 'show' : 'fade'} bg-dark bg-opacity-75 p-1"
	style="display: {isShow ? 'block' : 'none'}; backdrop-filter: blur(.06em);"
>
	<div
		class="rounded h-100 d-flex align-items-start justify-content-end {_class}"
		style="background-image: url({url}); background-repeat: no-repeat; background-position: center; background-size: contain; min-height:13em;"
	>
		<button
			aria-label="Закрыть"
			class="btn btn-sm btn-dark bg-dark me-1 p-1 bg-opacity-10 border-0 position-fixed z-3"
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
