<script lang="ts">
	let { children } = $props();
</script>

<div class="d-flex flex-column gap-3 w-100">
	{@render children?.()}
</div>
