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
