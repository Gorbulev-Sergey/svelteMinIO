<script lang="ts">
	let idDialog = crypto.randomUUID();
	let dialog = $derived(document.getElementById(idDialog) as HTMLDialogElement);
</script>

<button
	class="btn btn-sm rounded-3"
	onclick={() => {
		dialog?.showModal();
	}}>
	Открыть диалог {idDialog}
</button>

<dialog
	id={idDialog}
	class="border-0 rounded-3 p-5 shadow-sm w-25">
	<div class="d-flex flex-column align-items-start gap-2 m-0">
		<h4>Заголовок</h4>
		<p>Содержимое окна</p>
		<button
			class="btn btn-sm rounded-3"
			onclick={() => {
				dialog?.close('Закрыт');
			}}>Закрыть</button>
	</div>
</dialog>
