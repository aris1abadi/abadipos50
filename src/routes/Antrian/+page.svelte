<script>
	// @ts-nocheck

	import { onMount } from 'svelte';

	import {
		dataMenuStore,
		n_order,
		newOrder,
		dataPelanggan,
		headerContent,
		dataSuplier,
		prosesClickVal,
		hapusOrderVal,
		simpanOrderVal
	} from '$lib/stores/store';
	import { goto } from '$app/navigation';
	import { io } from '$lib/realtime';
	import { getTanggal, getJam, sendToServer } from '$lib/myFunction.js';
	import { Modal, Tabs, TabItem, ButtonGroup, Button,Avatar } from 'flowbite-svelte';

	// @ts-ignore
	import Pembayaran from '$lib/Pembayaran.svelte';

	let hariIni = getTanggal(Date.now());
	let antrianHariIni = [];
	let antrianLama = [];
	let antrianPesenan = [];
	let modalOpen = false;

	let varPembayaran = {
		btnShow: true,
		modeBayar: 'Kasir',
		pelanggan: $dataPelanggan,
		suplier: $dataSuplier,
		data: $n_order
	};

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
							antrianHariIni.push(antrian);
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

		if (!$dataMenuStore) {
			sendToServer('getMenu');
		}

		goto('/Kasir');
	}

	function bayar_tagihan(order) {
		$n_order = order;
		varPembayaran.data = $n_order;
		modalOpen = true;
	}
	function btnSimpanClick() {
		modalOpen = false;
		$n_order = varPembayaran.data;
		io.emit('updateTransaksiJual', $n_order);
	}

	function btnSelesaiClick() {
		modalOpen = false;
	}

	function btnAmbilClick(dataOrder) {
		io.emit('closeTransaksiJual', dataOrder);
		sendToServer('getTransaksiJualOpen');
	}

	let antrianSelect = 1;
</script>

<Modal title="Pembayaran" bind:open={modalOpen} outsideclose>
	<Pembayaran
		bind:varPembayaran
		on:eventSimpanClick={() => btnSimpanClick()}
		on:eventSelesaiClick={() => btnSelesaiClick()}
	/>
</Modal>
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
<div class="max-h-88 w-full px-5 overflow-y-auto">
	{#if antrianSelect === 1}
		{#if antrianHariIni.length > 0}
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
								><Avatar class="h-7 h-7" src="edit1.svg"/></button
							>
						</div>
					</div>

					<hr class="mb-2" />

					<div class="grid grid-cols-3 gap-1 mb-4">
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
									class="w-8 h-8 border border-orange-700 rounded-lg"><Avatar src="/edit.svg"/>

									</button
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
