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
	class="modal modal-xl {isShow ? 'show' : 'fade'} bg-dark bg-opacity-75"
	style="display: {isShow ? 'block' : 'none'}; backdrop-filter: blur(.04em);"
>
	<div
		class="modal-dialog modal-dialog-centered m-auto p-0"
		style="max-width: auto; max-height: auto;"
	>
		<div
			class="modal-content rounded shadow-sm bg-white p-0 {_class} position-relative"
			style="border-width: 0;"
		>
			<button
				aria-label="Закрыть"
				class="btn btn-sm bg-light btn-close sticky-top position-absolute"
				style="top: .7em; right:.7em;"
				onclick={() => {
					isShow = false;
					onClose();
				}}
			></button>
			{@render children?.()}
		</div>
	</div>
</div>
