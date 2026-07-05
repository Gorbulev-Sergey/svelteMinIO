<script lang="ts">
	import type { Snippet } from 'svelte';

	interface IProps {
		title?: string;
		isShow?: boolean;
		_class?: string;
		children?: Snippet<[]>;
		onSave?: () => void;
		onClose?: () => void;
	}
	let {
		title,
		isShow = $bindable(false),
		_class,
		children,
		onSave = () => {},
		onClose = () => {}
	}: IProps = $props();
</script>

<div
	class="modal {isShow ? 'show' : 'fade'} bg-dark bg-opacity-10"
	style="display: {isShow ? 'block' : 'none'}; backdrop-filter: blur(.04em);"
>
	<div class="modal-dialog modal-dialog-centered modal-dialog-scrollable" tabindex="-1">
		<div
			class="modal-content rounded shadow-sm w-100 bg-white p-1 {_class}"
			style="border-width: 0;"
		>
			<div class="d-flex align-self-center justify-content-between p-2 w-100">
				<h5 class="ps-1 mb-0">{title}</h5>
				<button
					aria-label="Закрыть"
					class="btn-close"
					onclick={() => {
						isShow = false;
						onClose();
					}}
				></button>
			</div>
			<div class="p-2">
				{@render children?.()}
			</div>
			<div class="d-flex align-items-center justify-content-between p-2">
				<button
					class="btn btn-light text-dark"
					onclick={() => {
						isShow = false;
						onClose();
					}}>Отмена</button
				>
				<button
					class="btn btn-dark text-light"
					onclick={() => {
						isShow = false;
						onSave();
						onClose();
					}}>Сохранить</button
				>
			</div>
		</div>
	</div>
</div>
