<script lang="ts">
	import Dialog from '$lib/components/Dialog.svelte';

	let isMyShow = $state(false);
	let isShow = $state(false);
	let id = crypto.randomUUID();
	let dialog = $derived(document.getElementById(id) as HTMLDialogElement);

	$effect(() => {
		if (isShow) dialog.showModal();
		else dialog.close();
		console.log(1);
	});
</script>

<button
	class="btn btn-sm rounded-3"
	onclick={() => {
		// dialog?.showModal();
		isMyShow = true;
	}}>
	Открыть диалог {id}
</button>

<dialog
	{id}
	class="my-dialog border-0 rounded-3 p-5 shadow-sm w-25">
	<div class="d-flex flex-column align-items-start gap-2 m-0">
		<h4>Заголовок</h4>
		<p>Содержимое окна</p>
		<div class="d-flex align-items-center justify-content-between w-100">
			<button
				class="btn btn-sm rounded-3"
				onclick={() => {
					dialog?.close('Закрыт');
				}}>Отмена</button>
			<button
				class="btn btn-sm btn-solid theme-inverse rounded-3"
				onclick={() => {
					dialog?.close('Закрыт');
				}}>Ok</button>
		</div>
	</div>
</dialog>

<Dialog
	title="Привет"
	bind:isShow={isMyShow}>
	<div>Как дела</div>
</Dialog>

<style>
	.my-dialog::backdrop {
		background: rgba(0, 0, 0, 0.2);
		backdrop-filter: blur(0.07em);
	}
</style>
