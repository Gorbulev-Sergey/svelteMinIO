<script lang="ts">
</script>

<div class="dropdown">
	<div class="d-inline">
		<button class="btn btn-sm btn-light dropbtn">Выпадающее меню</button>
		<button class="btn btn-light px-1 rounded-end" data-bs-toggle="dropdown" aria-label="">
			<i class="fa-solid fa-angles-down"></i>
		</button>
	</div>
	<div class="dropdown-content rounded shadow-sm">
		{#each [...new Array(5)] as item, i}
			<a
				class="btn btn-sm btn-light rounded-0 w-100 text-start {i == 0 ? 'rounded-top' : ''} {i ==
				[...new Array(5)].length - 1
					? 'rounded-bottom'
					: ''}"
				href="#">Ссылка {i + 1}</a
			>
		{/each}
	</div>
</div>

<style>
	/* Контейнер для позиционирования */
	.dropdown {
		position: relative;
		display: inline-block;
	}

	/* Скрытое выпадающее содержимое */
	.dropdown-content {
		display: none; /* По умолчанию скрыто */
		position: absolute; /* Позиционирование относительно ближайшего позиционированного родителя */
		background-color: #f1f1f1;
		min-width: 160px; /* Минимальная ширина блока */
		z-index: 1; /* Чтобы меню отображалось поверх других элементов */
	}

	/* Показ выпадающего меню при наведении на контейнер */
	.dropdown:hover .dropdown-content {
		display: block; /* Блок становится видимым */
	}

	/* Опционально: изменение цвета триггера при отображении подменю */
	.dropdown:hover .dropbtn {
		background-color: var(--bs-dark);
		color: var(--bs-light);
	}
</style>
