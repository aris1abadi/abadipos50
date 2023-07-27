<script>
	//import Header from '$lib/Header.svelte';
	import { dataMenuStore,dataBahanStore } from '$lib/stores/store';
	import { ButtonGroup, Button,Avatar } from 'flowbite-svelte';

	let setupSelect = 'menu';
</script>

<div class="w-full h-10">
	<ButtonGroup class="grid grid-cols-4 px-4 my-4 w-full h-full text-white">
		<Button on:click={() => (setupSelect = 'menu')} pill class="bg-orange-500 text-white"
			>Setup Menu</Button
		>
		<Button on:click={() => (setupSelect = 'bahan')} pill class="bg-orange-500">Setup Bahan</Button>
		<Button on:click={() => (setupSelect = 'user')} pill class="bg-orange-500">Setup User</Button>
		<Button on:click={() => (setupSelect = 'system')} pill class="bg-orange-500"
			>Setup System</Button
		>
	</ButtonGroup>
</div>
<div class="w-full h-4/6 bg-gray-300 mt-20 overflow-y-auto">
	{#if setupSelect === 'menu'}
		
		<div >
			{#if $dataMenuStore.length > 0}
				{#each $dataMenuStore as menu,index }
				<div class="grid grid-cols-5 w-full h-16 px-4">
					<Avatar src="kopi1.jpeg" rounded></Avatar>
					<div class='col-span-2'>{index + 1}.{menu.nama}</div>
					<div></div>
					<Avatar src="edit1.svg"></Avatar>
				</div>
					
					
				{/each}
			{/if}
		</div>
	{:else if setupSelect === 'bahan'}
		<div />
	{:else if setupSelect === 'user'}
		<div />
	{:else if setupSelect === 'system'}
		<div />
	{/if}
</div>
