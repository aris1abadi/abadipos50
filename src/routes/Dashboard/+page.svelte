<script>
	// @ts-nocheck

	//import Header from '$lib/Header.svelte';
	import {
		dataMenuStore,
		dataBahanStore,
		dataTransaksiJual,
		transaksiJualCount,
		dataPelanggan,
		
	} from '$lib/stores/store.js';
	import { io } from '$lib/realtime';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	//import { faUser, faSave, faTrashCan } from '@fortawesome/free-regular-svg-icons';
	import { sendToServer, rupiah } from '$lib/myFunction.js';
	import Header from '$lib/Header.svelte';

	//import { Datepicker, Input, initTE } from "tw-elements";

	//var penjualan
	let closeTransaksiNow = [];
	let jmlTransaksi = [];
	let hargaTransaksi = [];
	let totalPenjualan = 0;

	//var pembelian
	let transaksiBeliNow = [];
	let jmlTransaksiBeli = [];
	let hargaTransaksiBeli = [];
	let totalPembelian = 0;

	onMount(() => {
		sendToServer('getMenu');
		sendToServer('getBahan');

		sendToServer('getTransaksiJual');
		sendToServer('getCloseTransaksiNow');
		sendToServer('getTransaksiBeliNow');
		sendToServer('getTransaksiJualCount');
		sendToServer('getPelanggan');

		io.on('myMenu', (msg) => {
			//$dataMenuStore = msg;
			$dataMenuStore = [];
			msg.forEach((menu) => {
				let dt = {
					id: menu.id,
					nama: menu.nama,
					harga: menu.harga,
					stok: menu.stok,
					resepId: menu.resepId,
					orderCount: 0,
					stokUse: 0
				};
				$dataMenuStore.push(dt);
				jmlTransaksi.push(0);
				hargaTransaksi.push(0);
			});
			//console.log('jmlTansaksi ', jmlTransaksi);
		});

		io.on('myBahan', (msg) => {
			//$dataBahanStore = msg;
			$dataBahanStore = [];

			msg.forEach(
				(
					/** @type {{ id: any; nama: any; harga: any; satuan: any; isi: any; }} */ bahan,
					/** @type {any} */ index
				) => {
					let bh = {
						id: bahan.id,
						nama: bahan.nama,
						stokId: bahan.stokId,
						harga: bahan.harga,
						satuan: bahan.satuan,
						isi: bahan.isi,
						belanjaCount: 0
					};

					$dataBahanStore.push(bh);
					jmlTransaksiBeli.push(0);
					hargaTransaksiBeli.push(0);
				}
			);
		});

		io.on('myTransaksiJual', (msg) => {
			$dataTransaksiJual = msg;
		});

		io.on('myTransaksiJualCount', (msg) => {
			$transaksiJualCount = msg;
		});

		io.on('myPelanggan', (msg) => {
			$dataPelanggan = msg;
		});

		io.on('myCloseTransaksiNow', (msg) => {
			closeTransaksiNow = msg;
			//console.log('Close transaksi ', msg);
			jmlTransaksi.forEach((tr, index) => {
				jmlTransaksi[index] = 0;
			});
			$dataMenuStore.forEach((menu, index) => {
				closeTransaksiNow.forEach((tn) => {
					tn.item.itemDetil.forEach((detil) => {
						if (detil.id === menu.id) {
							//console.log("Item detil: ",detil)
							jmlTransaksi[index] += detil.jml;
							hargaTransaksi[index] = detil.harga;
						}
					});
				});
			});
			totalPenjualan = 0
			jmlTransaksi.forEach((jml, index) => {
				totalPenjualan += jml * hargaTransaksi[index];
			});
			//console.log("Jumlah transaksi ",jmlTransaksi)
		});

		io.on('myTransaksiBeliNow', (msg) => {
			transaksiBeliNow = msg;
			//console.log('transaksi beli ', msg);
			jmlTransaksiBeli.forEach((tr, index) => {
				jmlTransaksiBeli[index] = 0;
			});
			$dataBahanStore.forEach((bahan, index) => {
				transaksiBeliNow.forEach((bhn) => {
					bhn.item.forEach((item) =>{
						if (item.id === bahan.id) {
						//console.log("Item detil: ",detil)
						jmlTransaksiBeli[index] += item.jml;
						hargaTransaksiBeli[index] = item.harga;
					}
					})
					
				});
			});
			totalPembelian =0
			jmlTransaksiBeli.forEach((jml, index) => {
				totalPembelian += jml * hargaTransaksiBeli[index];
			});
		});
	});
</script>

<div class=" w-full h-full mt-8 pl-4 pr-4">
	<div class="w-full border border-orange-600 rounded-lg">
		<div
			class="w-full h-10 border-b border-orange-500 rounded-lg rounded-bl-none rounded-br-none bg-orange-500 text-center font-mono font-bold text-xl text-white pt-2"
		>
			Penjualan Hari Ini
		</div>
		<div class="pl-4 font-mono pb-4">
			<ul>
				{#if $dataMenuStore.length > 0}
					{#each $dataMenuStore as menu, idx}
						{#if jmlTransaksi[idx]}
							<li>
								<div class="grid grid-cols-6 mt-2">
									<div class="col-span-3">
										{menu.nama}
									</div>
									<div class="text-right mr-6">{jmlTransaksi[idx]}</div>
									<div class="col-span-2 text-right mr-3">
										{rupiah(jmlTransaksi[idx] * hargaTransaksi[idx])}
									</div>
								</div>
							</li>
						{/if}
					{/each}
					<hr />
					<div class="grid grid-cols-6 mt-2">
						<div class="col-span-4" />
						<div class="col-span-2 text-right font-mono font-bold mr-3">
							{rupiah(totalPenjualan)}
						</div>
					</div>
				{:else}
					<div class="border border-blue-300 shadow rounded-md p-4 max-w-sm w-full mx-auto my-10">
						<div class="animate-pulse flex space-x-4">
							<div class="rounded-full bg-slate-200 h-10 w-10" />
							<div class="flex-1 space-y-6 py-1">
								<div class="h-2 bg-slate-200 rounded" />
								<div class="space-y-3">
									<div class="grid grid-cols-3 gap-4">
										<div class="h-2 bg-slate-200 rounded col-span-2" />
										<div class="h-2 bg-slate-200 rounded col-span-1" />
									</div>
									<div class="h-2 bg-slate-200 rounded" />
								</div>
							</div>
						</div>
					</div>
				{/if}
			</ul>
		</div>
	</div>
	<div class="w-full border border-orange-600 rounded-lg mt-6">
		<div
			class="w-full h-10 border-b border-orange-500 rounded-lg rounded-bl-none rounded-br-none bg-orange-500 text-center font-mono font-bold text-xl text-white pt-2"
		>
			Pengeluaran Hari Ini
		</div>
		<div class="pl-4 font-mono pb-4">
			<ul>
				{#if $dataBahanStore}
					{#each $dataBahanStore as bahan, idx}
						{#if jmlTransaksiBeli[idx]}
							<li>
								<div class="grid grid-cols-6 mt-2">
									<div class="col-span-3">
										{bahan.nama}
									</div>
									<div class="text-right mr-6">{jmlTransaksiBeli[idx]}</div>
									<div class="col-span-2 text-right mr-3">
										{rupiah(jmlTransaksiBeli[idx] * hargaTransaksiBeli[idx])}
									</div>
								</div>
							</li>
						{/if}
					{/each}
					<hr />
					<div class="grid grid-cols-6 mt-2">
						<div class="col-span-4" />
						<div class="col-span-2 text-right font-mono font-bold mr-3">
							{rupiah(totalPembelian)}
						</div>
					</div>
				{:else}
				<div class="border border-blue-300 shadow rounded-md p-4 max-w-sm w-full mx-auto my-10">
					<div class="animate-pulse flex space-x-4">
						<div class="rounded-full bg-slate-200 h-10 w-10" />
						<div class="flex-1 space-y-6 py-1">
							<div class="h-2 bg-slate-200 rounded" />
							<div class="space-y-3">
								<div class="grid grid-cols-3 gap-4">
									<div class="h-2 bg-slate-200 rounded col-span-2" />
									<div class="h-2 bg-slate-200 rounded col-span-1" />
								</div>
								<div class="h-2 bg-slate-200 rounded" />
							</div>
						</div>
					</div>
				</div>
				{/if}
			</ul>
		</div>
	</div>
</div>
