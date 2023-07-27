<script>
	// @ts-nocheck

	import { onMount } from 'svelte';

	import {
		dataMenuStore,
		n_order,
		newOrder,
		dataPelanggan,
		
	} from '$lib/stores/store';
	import { goto } from '$app/navigation';
	import { io } from '$lib/realtime';
	import { getTanggal, getJam, sendToServer } from '$lib/myFunction.js';
	import {  ButtonGroup, Button,Avatar } from 'flowbite-svelte';

	// @ts-ignore
	

	let hariIni = getTanggal(Date.now());
	let antrianHariIni = [];
	let antrianLama = [];
	let antrianPesenan = [];
	

	

	onMount(() => {
		sendToServer('getTransaksiJualOpen');
		io.on('myTransaksiJualOpen', (msg) => {
			//$dataTransaksiJual = msg;
			//console.log(msg)

			//reset antian
			antrianHariIni = [];
			antrianLama = [];
			antrianPesenan = [];
			//console.log(hariIni)
			hariIni = getTanggal(Date.now());
			if (msg) {
				msg.forEach((antrian, index) => {
					if (antrian.jenisOrder === 'Pesan') {
						antrianPesenan.push(antrian);
					} else {
						let wto = getTanggal(antrian.waktuOrder);
						//console.log(wto)
						if (wto === hariIni) {
							if(antrian.status === "open"){
							antrianHariIni.push(antrian);
							}
						} else {
							antrianLama.push(antrian);
						}
					}
				});
			}

			antrianHariIni = antrianHariIni;
			antrianLama = antrianLama;
			antrianPesenan = antrianPesenan;
			//
			//$headerContent.jmlAntrian = antrianHariIni.length
			//console.log("jumlah antrian ",antrianHariIni)
		});

		if (!$dataPelanggan) {
			sendToServer('getPelanggan');
		}

		io.on('myPelanggan', (msg) => {
			$dataPelanggan = msg;
		});
	});

	//
	function antrian_click(antrian) {
		//hapusOrder();
		$newOrder = false;
		$n_order = antrian;		

		goto('/Kasir');
	}

	
	

	function btnAmbilClick(dataOrder) {
		io.emit('closeTransaksiJual', dataOrder);
		//sendToServer('getTransaksiJualOpen');
	}

	let antrianSelect = 1;
</script>


<div class="w-full h-12 px-8 my-4 ">
	<ButtonGroup class="w-full">
		<Button
			on:click={() => (antrianSelect = 1)}
			class="w-1/3 border-orange-500 {antrianSelect === 1
				? 'bg-orange-500 text-white'
				: 'bg-white text-black'}"
			>Antrian Hari Ini
		</Button>
		<Button
			on:click={() => (antrianSelect = 2)}
			class="w-1/3 border-orange-500 {antrianSelect === 2
				? 'bg-orange-500 text-white'
				: 'bg-white text-black'}">Tersimpan</Button
		>
		<Button
			on:click={() => (antrianSelect = 3)}
			class="w-1/3 border-orange-500 {antrianSelect === 3
				? 'bg-orange-500 text-white'
				: 'bg-white text-black'}">Pesan</Button
		>
	</ButtonGroup>
</div>
<div class="max-h-full w-full px-5 overflow-y-auto">
	{#if antrianSelect === 1}
		{#if antrianHariIni.length > 0}
			{#each antrianHariIni as antrian, index}
				<div
					class="bg-white w-full border border-orange-400 rounded-xl rounded-tl-none rounded-br-none my-2 p-2"
				>
					<div class="grid grid-cols-5 gap-2 bg-gray-200 pl-4 pt-2 w-full h-14 mt-1 mb-2">
						<div class="col-span-3">
							<div><b> {antrian.pelanggan.nama}</b><i class="text-xs"> ({antrian.id}) </i></div>
							<div>
								<i class="text-xs"> {antrian.jenisOrder} </i>
								<i class="text-xs">{getJam(antrian.waktuOrder)}</i>
							</div>
						</div>
						<div>
							{#if antrian.totalBayar === antrian.totalTagihan}
								<button
									on:click={() => btnAmbilClick(antrian)}
									class="w-full h-7 border border-orange-400 rounded"
								>
									Ambil
								</button>
							{/if}
						</div>
						<div>
							<button
								on:click={() => antrian_click(antrian)}
								><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8">
									<path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
								  </svg>
								  </button
							>
						</div>
					</div>

					<hr class="mb-2" />

					<div class="grid grid-cols-3 pl-4 gap-1 mb-4">
						<div class="font-mono font-thin text-xs">{getJam(antrian.item.time)}</div>
						<div class="col-span-2 w-full">
							{#each antrian.item.itemDetil as item_detil}
								<div class="  font-mono text-sm text-left ml-2">
									<div>{item_detil.nama}({item_detil.jml})</div>
									{#if item_detil.catatan}
										<div>
											{item_detil.catatan}
										</div>
									{/if}
								</div>
							{/each}
						</div>
					</div>

					<div class="my-2" />
				</div>
			{/each}
		{/if}
	{:else if antrianSelect === 2}
		
			{#if antrianLama.length >0}
				{#each antrianLama as antrian, index}
					<div
						class="bg-white w-full border border-orange-400 rounded-xl rounded-tl-none rounded-br-none my-2 p-2"
					>
						<div class="grid grid-cols-5 gap-2 w-full h-12 mt-1 mb-2">
							<div class="col-span-3">
								<div><b> {antrian.pelanggan.nama}</b><i class="text-xs"> ({antrian.id}) </i></div>
								<div>
									<i class="text-xs"> {antrian.jenisOrder} </i>
									<i class="text-xs">{getJam(antrian.waktuOrder)}</i>
								</div>
							</div>
							<div>
								{#if antrian.totalBayar === antrian.totalTagihan}
									<button
										on:click={() => btnAmbilClick(antrian)}
										class="w-full h-7 border border-orange-400 rounded"
									>
										Ambil
									</button>
								{/if}
							</div>
							<div>
								<button
									on:click={() => antrian_click(antrian)}
									><Avatar class="h-7 h-7" src="edit1.svg"/></button
								>
							</div>
						</div>
						<hr class="mb-2" />

						<div class="grid grid-cols-3 gap-1 mb-4">
							<div class="font-mono font-thin text-xs">{getJam(antrian.item.time)}</div>
							<div>
								{#each antrian.item.itemDetil as item_detil}
									<div class="w-full font-mono text-sm text-left ml-2">
										{item_detil.nama}({item_detil.jml})
									</div>
									{#if item_detil.catatan}
										<div class="w-full font-mono text-sm text-left ml-2">
											{item_detil.catatan}
										</div>
									{/if}
								{/each}
							</div>
						</div>

						<div class="my-2" />
					</div>
				{/each}
			{/if}
		
	{:else if antrianSelect === 3}
		
			{#if antrianPesenan.length > 0}
				{#each antrianPesenan as antrian, index}
					<div
						class="bg-white w-full border border-orange-400 rounded-xl rounded-tl-none rounded-br-none my-2 p-2"
					>
						<div class="grid grid-cols-5 gap-2 w-full h-12 mt-1 mb-2">
							<div class="col-span-3">
								<div><b> {antrian.pelanggan.nama}</b><i class="text-xs"> ({antrian.id}) </i></div>
								<div>
									<i class="text-xs"> {antrian.jenisOrder} Untuk: </i>
									<i class="text-xs">{getTanggal(antrian.waktuKirim)}</i>
									<i class="text-xs">{getJam(antrian.waktuKirim)}</i>
								</div>
							</div>
							<div>
								{#if antrian.totalBayar === antrian.totalTagihan}
									<button
										on:click={() => btnAmbilClick(antrian)}
										class="w-full h-7 border border-orange-400 rounded"
									>
										Ambil
									</button>
								{/if}
							</div>
							<div>
								<button
									on:click={() => antrian_click(antrian)}
									><Avatar class="h-7 h-7" src="edit1.svg"/></button
								>
							</div>
						</div>
						<hr class="mb-2" />

						<div class="grid grid-cols-3 gap-1 mb-4">
							<div class="font-mono font-thin text-xs">{getJam(antrian.item.time)}</div>
							<div>
								{#each antrian.item.itemDetil as item_detil}
									<div class="w-full font-mono text-sm text-left ml-2">
										{item_detil.nama}({item_detil.jml})
									</div>
									{#if item_detil.catatan}
										<div class="w-full font-mono text-sm text-left ml-2">
											{item_detil.catatan}
										</div>
									{/if}
								{/each}
							</div>
						</div>

						<div class="my-2" />
					</div>
				{/each}
			{/if}
		
	{/if}
</div>
<!--
<Tabs style="underline">
	<TabItem open title="Antrian Hari Ini">
		<div class="h-3/4 w-full px-5 overflow-y-auto ">
			{#if antrianHariIni}
				{#each antrianHariIni as antrian, index}
					<div
						class="bg-white w-full border border-orange-400 rounded-xl rounded-tl-none rounded-br-none my-2 p-2"
					>
						<div class="grid grid-cols-5 gap-2 w-full h-12 mt-1 mb-2">
							<div class="col-span-3">
								<div><b> {antrian.pelanggan.nama}</b><i class="text-xs"> ({antrian.id}) </i></div>
								<div>
									<i class="text-xs"> {antrian.jenisOrder} </i>
									<i class="text-xs">{getJam(antrian.waktuOrder)}</i>
								</div>
							</div>
							<div>
								{#if antrian.totalBayar === antrian.totalTagihan}
									<button
										on:click={() => btnAmbilClick(antrian)}
										class="w-full h-7 border border-orange-400 rounded"
									>
										Ambil
									</button>
								{/if}
							</div>
							<div>
								<button
									on:click={() => antrian_click(antrian)}
									class="w-full h-7 border border-orange-400 rounded">Tambah</button
								>
							</div>
						</div>

						<hr class="mb-2" />

						<div class="grid grid-cols-3 gap-1 mb-4">
							<div class="font-mono font-thin text-xs">{getJam(antrian.item.time)}</div>
							<div>
								{#each antrian.item.itemDetil as item_detil}
									<div class="w-full col-span-2 font-mono text-sm text-left ml-2">
										<div>{item_detil.nama}({item_detil.jml})</div>
										{#if item_detil.catatan}
											<div>
												{item_detil.catatan}
											</div>
										{/if}
									</div>
								{/each}
							</div>
						</div>

						<div class="my-2" />
					</div>
				{/each}
			{/if}
		</div>
	</TabItem>
	<TabItem title="Antrian Tersimpan">
		<div class="h-full w-full px-5 overflow-y-auto bg-white">
			{#if antrianLama}
				{#each antrianLama as antrian, index}
					<div
						class="bg-white w-full border border-orange-400 rounded-xl rounded-tl-none rounded-br-none my-2 p-2"
					>
						<div class="grid grid-cols-5 gap-2 w-full h-12 mt-1 mb-2">
							<div class="col-span-3">
								<div><b> {antrian.pelanggan.nama}</b><i class="text-xs"> ({antrian.id}) </i></div>
								<div>
									<i class="text-xs"> {antrian.jenisOrder} </i>
									<i class="text-xs">{getJam(antrian.waktuOrder)}</i>
								</div>
							</div>
							<div>
								{#if antrian.totalBayar === antrian.totalTagihan}
									<button
										on:click={() => btnAmbilClick(antrian)}
										class="w-full h-7 border border-orange-700 rounded-lg"
									>
										Ambil
									</button>
								{/if}
							</div>
							<div>
								<button
									on:click={() => antrian_click(antrian)}
									class="w-full h-7 border border-orange-700 rounded-lg">Tambah</button
								>
							</div>
						</div>
						<hr class="mb-2" />

						<div class="grid grid-cols-3 gap-1 mb-4">
							<div class="font-mono font-thin text-xs">{antrian.item.time}</div>
							<div>
								{#each antrian.item.itemDetil as item_detil}
									<div class="w-full font-mono text-sm text-left ml-2">
										{item_detil.nama}({item_detil.jml})
									</div>
									{#if item_detil.catatan}
										<div class="w-full font-mono text-sm text-left ml-2">
											{item_detil.catatan}
										</div>
									{/if}
								{/each}
							</div>
						</div>

						<div class="my-2" />
					</div>
				{/each}
			{/if}
		</div>
	</TabItem>
	<TabItem title="Pesenan">
		<div class="h-full w-full px-5 overflow-y-auto bg-white">
			{#if antrianPesenan}
				{#each antrianPesenan as antrian, index}
					<div
						class="bg-white w-full border border-orange-400 rounded-xl rounded-tl-none rounded-br-none my-2 p-2"
					>
						<div class="grid grid-cols-5 gap-2 w-full h-12 mt-1 mb-2">
							<div class="col-span-3">
								<div><b> {antrian.pelanggan.nama}</b><i class="text-xs"> ({antrian.id}) </i></div>
								<div>
									<i class="text-xs"> {antrian.jenisOrder} </i>
									<i class="text-xs">{getJam(antrian.waktuOrder)}</i>
								</div>
							</div>
							<div>
								{#if antrian.totalBayar === antrian.totalTagihan}
									<button
										on:click={() => btnAmbilClick(antrian)}
										class="w-full h-7 border border-orange-700 rounded-lg"
									>
										Ambil
									</button>
								{/if}
							</div>
							<div>
								<button
									on:click={() => antrian_click(antrian)}
									class="w-full h-7 border border-orange-700 rounded-lg">Tambah</button
								>
							</div>
						</div>
						<hr class="mb-2" />

						<div class="grid grid-cols-3 gap-1 mb-4">
							<div class="font-mono font-thin text-xs">{antrian.item.time}</div>
							<div>
								{#each antrian.item.itemDetil as item_detil}
									<div class="w-full font-mono text-sm text-left ml-2">
										{item_detil.nama}({item_detil.jml})
									</div>
									{#if item_detil.catatan}
										<div class="w-full font-mono text-sm text-left ml-2">
											{item_detil.catatan}
										</div>
									{/if}
								{/each}
							</div>
						</div>

						<div class="my-2" />
					</div>
				{/each}
			{/if}
		</div>
	</TabItem>
</Tabs>

-->
