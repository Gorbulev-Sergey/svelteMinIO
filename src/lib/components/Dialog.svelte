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

	let id = crypto.randomUUID();
	let dialog = $derived(document.getElementById(id) as HTMLDialogElement);
	$effect(() => {
		if (isShow) dialog.showModal();
		else dialog.close();
	});

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

<dialog
	{id}
	class="my-dialog border-0 rounded-3 p-4 shadow-sm"
	style="min-width: 25%;">
	<div class=" d-flex flex-column align-items-start gap-2 m-0 {_class}">
		<div class="d-flex align-self-center justify-content-between w-100">
			<b class="ps-1 mb-0">{@html title}</b>
			<button
				title="Закрыть"
				class="btn btn-icon position-absolute"
				style="top:.5em; right:.5em;"
				onclick={() => {
					isShow = false;
					onCancel();
				}}>
				<i class="bi bi-x-lg"></i>
			</button>
		</div>
		<div class="d-flex flex-column gap-2 p-1">
			{@render children?.()}
		</div>
		<div class="d-flex align-items-center justify-content-between w-100">
			<button
				class="btn btn-sm rounded-3"
				onclick={() => {
					isShow = false;
					onCancel();
				}}>{buttonCancelTitle}</button>
			<button
				class="btn btn-sm btn-solid theme-inverse rounded-3"
				onclick={() => {
					onOk();
					if (autoCloseOnOk) {
						isShow = false;
						onCancel();
					}
				}}>{buttonOkTitle}</button>
		</div>
	</div>
</dialog>

<style>
	.my-dialog::backdrop {
		background: rgba(0, 0, 0, 0.2);
		backdrop-filter: blur(0.07em);
	}
</style>
