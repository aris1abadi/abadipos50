<script>
	
	import Header from '$lib/Header.svelte';
	import { hapusOrderVal, prosesClickVal, headerContent, simpanOrderVal } from '$lib/stores/store';

	

</script>

<Header
	on:eventProsesClick={() => ($prosesClickVal = true)}
	on:eventHapusOrder={() => ($hapusOrderVal = true)}
	on:eventHeaderSimpan={() => ($simpanOrderVal = true)}
	bind:headerContent={$headerContent}
/>
<div class="grid grid-cols-4 gap-4 my-5">
	<button
		
		class="w-full h-20 border rounded border-orange-500">Tambah Menu</button
	>

	<button
		
		class="w-full h-20 border rounded border-orange-500">tes picker</button
	>

	<button class="w-full h-20 border rounded border-orange-500" />

	<button class="w-full h-20 border rounded border-orange-500" />
</div>
