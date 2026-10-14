<script lang="ts">
	import Column from '$lib/components/Column.svelte';

	let isOpen = $state(false);
	let openAtr = $derived(isOpen ? { open: true } : {});
</script>

<button
	class="btn"
	onclick={() => (isOpen = true)}>
	Open dialog
</button>

<div
	class={isOpen ? 'd-flex justify-content-center align-items-center bg-info bg-70' : ''}
	style={isOpen
		? 'position: fixed; top: 0; left: 0; display: block; width: 100%; height: 100%;  overflow-x: hidden; overflow-y: auto; outline: 0;z-index:50000'
		: ''}>
	<dialog
		class="dialog"
		{...openAtr}>
		<div class="dialog-header">
			<h1 class="dialog-title">Dialog title</h1>
			<button
				type="button"
				class="btn-close"
				aria-label="Close"
				onclick={() => (isOpen = false)}></button>
		</div>
		<div class="dialog-body">
			<p>
				This is a native dialog element. It uses the browser’s built-in modal behavior for accessibility and focus
				management.
			</p>
		</div>
		<div class="dialog-footer">
			<button
				type="button"
				class="btn-solid theme-secondary"
				onclick={() => (isOpen = false)}>Close</button>
			<button
				type="button"
				class="btn-solid theme-primary">Save changes</button>
		</div>
	</dialog>
</div>
