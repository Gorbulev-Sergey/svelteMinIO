<script lang="ts">
	import type { Snippet } from 'svelte';

	interface IProps {
		title?: string;
		buttonOkTitle?: string;
		buttonCancelTitle?: string;
		isShow?: boolean;
		autoCloseOnOk?: boolean;
		_class?: string;
		children?: Snippet<[]>;
		onOk?: () => void;
		onCancel?: () => void;
	}
	let {
		title,
		buttonOkTitle = 'Ок',
		buttonCancelTitle = 'Отмена',
		autoCloseOnOk = true,
		isShow = $bindable(false),
		_class,
		children,
		onOk = () => {},
		onCancel = () => {}
	}: IProps = $props();
</script>

<div
	class="modal {isShow ? 'show' : 'fade'} bg-dark bg-opacity-10"
	style="display: {isShow ? 'block' : 'none'}; backdrop-filter: blur(.06em);">
	<div
		class="modal-dialog modal-dialog-centered modal-dialog-scrollable"
		tabindex="-1">
		<div class="modal-content rounded shadow-sm border-0 w-100 bg-white {_class}">
			<div class="d-flex flex-column gap-2 p-2">
				<div class="d-flex align-self-center justify-content-between w-100">
					<b class="ps-1 mb-0">{@html title}</b>
					<button
						aria-label="Закрыть"
						class="btn-close"
						onclick={() => {
							isShow = false;
							onCancel();
						}}></button>
				</div>
				<div class="d-flex flex-column gap-2 p-1">
					{@render children?.()}
				</div>
				<div class="d-flex align-items-center justify-content-between">
					<button
						class="btn btn-sm btn-light text-dark"
						onclick={() => {
							isShow = false;
							onCancel();
						}}>{buttonCancelTitle}</button>
					<button
						class="btn btn-sm btn-dark text-light"
						onclick={() => {
							onOk();
							if (autoCloseOnOk) {
								isShow = false;
								onCancel();
							}
						}}>{buttonOkTitle}</button>
				</div>
			</div>
		</div>
	</div>
</div>
