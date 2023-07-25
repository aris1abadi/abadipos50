<script>
	// @ts-nocheck

	import { onMount } from 'svelte';

	import {
		dataMenuStore,
		transaksiJualCount,
		dataTransaksiJual,
		n_order,
		newOrder,
		dataPelanggan,
		headerContent,
		dataSuplier
	} from '$lib/stores/store.js';
	import { goto } from '$app/navigation';

	import { tick } from 'svelte';
	import { io } from '$lib/realtime';
	//import { goto } from '$app/navigation';
	import Pad from '$lib/Pad.svelte';

	import { bikinIdTransaksi, rupiah, getJam, getTanggal } from '$lib/myFunction';
	// @ts-ignore
	import Pembayaran from '$lib/Pembayaran.svelte';
	import { Modal } from 'flowbite-svelte';
	import Header from '$lib/Header.svelte';

	import { Dropdown, Avatar, Card, DropdownItem, Chevron, Input } from 'flowbite-svelte';

	let loginProgress, loginSwipeable, introProgress, zoomOut;
	tick().then(() => (zoomOut = true));

	//let displayMode = 'penjualan'; //menu & antrian,penjualan,pembayaran
	let imgdef = '/kopi1.jpeg';
	let mejaImg = '/meja.png';

	/**
	 * @type {any[]}
	 */
	let padShow = [];
	let modalOpen = false;
	let jmlMeja = 10;
	let mejaCount = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
	let varPembayaran = {
		btnShow: true,
		modeBayar: 'Kasir',
		pelanggan: $dataPelanggan,
		suplier: $dataSuplier,
		data: $n_order
	};
	let menuItem = [];
	let mode1 = false;
	let menuOpen = false;
	let pelangganOpen = false;
	let orderOpen = false;
	let homeOpen = false;

	//let waktuOrder = String(new Date());

	//let waktuOrder = $n_order.waktuOrder;
	//let padPesenanShow = false;
	//----------------------------------
	onMount(() => {
		//initTE({ Datepicker, Input });
		menuItem = [];
		$headerContent.mode = 'Kasir';
		$headerContent.show = true;

		kirimKeServer('getMenu');

		if ($newOrder) {
			//kirimKeServer('getMenuPesenan');
			if (!$dataTransaksiJual) {
				kirimKeServer('getTransaksiJual');
			}
			kirimKeServer('getTransaksiJualCount');
			kirimKeServer('getPelanggan');
			hapusOrder();
		} else {
			$n_order.item.itemDetil.forEach((item, index) => {
				$dataMenuStore.forEach((menu, idx) => {
					if (item.id === menu.id) {
						//update data stok
						let newData = {
							id: item.id,
							nama: item.nama,
							harga: item.harga,
							jml: item.jml,
							stok: menu.stok
						};
						menuItem.push(newData);
					}
				});
			});
		}

		io.on('myMenu', (msg) => {
			if (typeof $dataMenuStore !== 'undefined' && $dataMenuStore.length > 0) {
				$dataMenuStore.forEach((menu, index) => {
					$dataMenuStore[index].stok = msg[index].stok;
				});
			} else {
				$dataMenuStore = [];
				// @ts-ignore
				msg.forEach((menu) => {
					let dt = {
						id: menu.id,
						nama: menu.nama,
						harga: menu.harga,
						stok: menu.stok,
						stokId: menu.stokId,
						stokUse: 0
					};
					$dataMenuStore.push(dt);
				});
				//console.log($dataMenuStore);
			}
		});

		io.on('paymentStatus', (msg) => {
			console.log(msg);
		});

		io.on('myTransaksiJual', (msg) => {
			$dataTransaksiJual = msg;
		});

		io.on('myTransaksiJualCount', (msg) => {
			$transaksiJualCount = msg;
			$n_order.id = bikinIdTransaksi('J', $transaksiJualCount);
			$headerContent.idTransaksi = $n_order.id;
			//console.log('id transaksi jual: ' + $n_order.id);
		});

		io.on('myPelanggan', (msg) => {
			$dataPelanggan = msg;
			//console.log('pelanggan: ', $dataPelanggan);
		});

		io.on('myStok', (msg) => {
			//console.log(msg);
			$dataMenuStore.forEach((mn, index) => {
				$dataMenuStore[index].stok = msg[index];
			});
		});

		//$n_order.pelanggan = $dataPelanggan[0];
	});

	function kirimKeServer(msg = '') {
		io.emit('fromClient', msg);
	}

	function hapusOrder() {
		$n_order.id = bikinIdTransaksi('J', $transaksiJualCount);
		$n_order.pelanggan = $dataPelanggan[0];
		$n_order.jenisOrder = 'Bungkus';
		$n_order.meja = 1;
		$n_order.alamatKirim = '';
		$n_order.map = '';
		$n_order.waktuOrder = Date.now();
		$n_order.waktuKirim = Date.now();
		$n_order.status = 'open';
		$n_order.totalItem = 0;
		$n_order.totalBayar = 0;
		$n_order.totalTagihan = 0;
		$n_order.item = [];

		$newOrder = true;
	}

	function pilihMenuClick(menu) {
		//tesTxt = JSON.stringify(menu)
		let newItem = {
			id: '',
			nama: '',
			harga: 0,
			jml: 0,
			stok: 0
		};
		menuOpen = false;
		if (menuItem.length > 0) {
			let isSama = false;
			menuItem.forEach((item, index) => {
				if (item.id === menu.id) {
					isSama = true;
					menuItem[index].jml += 1;
					if (menuItem[idx].stok !== -1) {
						menuItem[idx].stok -= 1;
					}
				}
			});
			if (!isSama) {
				newItem.id = menu.id;
				newItem.nama = menu.nama;
				newItem.harga = menu.harga;
				newItem.jml = 1;
				if (menu.stok !== -1) {
					newItem.stok = menu.stok - 1;
				} else {
					newItem.stok = menu.stok;
				}

				menuItem.push(newItem);
				menuItem = menuItem;
			}
		} else {
			newItem.id = menu.id;
			newItem.nama = menu.nama;
			newItem.harga = menu.harga;
			newItem.jml = 1;

			if (menu.stok !== -1) {
				newItem.stok = menu.stok - 1;
			} else {
				newItem.stok = menu.stok;
			}
			menuItem.push(newItem);
			menuItem = menuItem;
		}
		//console.log(menuItem);
		updateTotal();
	}
	function hapusItemOrder(idx) {
		if (menuItem[idx].stok !== -1) {
			menuItem[idx].stok += 1;
		}
		if (--menuItem[idx].jml === 0) {
			let newMenu = [];
			menuItem.forEach((menu, index) => {
				if (index !== idx) {
					newMenu.push(menu);
				}
			});

			menuItem = newMenu;
		}

		updateTotal();
	}

	function tambahItemClick(idx) {
		if (menuItem[idx].stok !== -1) {
			menuItem[idx].stok -= 1;
		}
		menuItem[idx].jml += 1;
		updateTotal();
	}

	function updateTotal() {
		let t_tagihan = 0;
		let t_item = 0;
		menuItem.forEach((menu, index) => {
			t_item += menu.jml;
			t_tagihan += menu.jml * menu.harga;
		});
		$n_order.totalItem = t_item;
		$n_order.totalTagihan = t_tagihan;
	}

	function pelangganClick(pelanggan) {
		$n_order.pelanggan = pelanggan;
		pelangganOpen = false;
	}

	function orderListClick(order) {
		$n_order.jenisOrder = order;
		if (order !== 'DiWarung') {
			orderOpen = false;
		}
	}

	function mejaClick(meja) {
		$n_order.meja = meja;
		mejaOpen = false;
		orderOpen = false;
	}

	let placement = 'top';
	let mejaOpen = false;
	const orderList = ['Bungkus', 'DiWarung', 'Pesan', 'Online', 'Gojeg'];
	let totalBayar = 0;

	function btnSimpanPenjualan() {
		let simpanItem = [];
		menuItem.forEach((menu) => {
			let dt = {
				id: menu.id,
				nama: menu.nama,
				harga: menu.harga,
				jml: menu.jml
			};
			simpanItem.push(dt)
		});

		let itemNow = {
			time: Date.now(),
			itemDetil: simpanItem
		};
		$n_order.item = itemNow;

		if ($newOrder) {
			io.emit('simpanTransaksiJual', $n_order);
		} else {
			io.emit('updateTransaksiJual', $n_order);
		}
		hapusSemua();

		hapusOrder();
	}

	function hapusSemua() {
		menuItem = [];
		$n_order.totalTagihan = 0; 
		$n_order.totalItem = 0;
		hapusOrder()
	}
	let bayarOpen = false;

	function bayarClick() {
		if (totalBayar >= $n_order.totalTagihan) {
			$n_order.totalBayar = $n_order.totalTagihan;
		} else {
			$n_order.totalBayar = totalBayar;
		}
		bayarOpen = false;
		//simpan pembayaran
		btnSimpanPenjualan()
	}
</script>

{#if mode1}
	<div>tes mode1</div>
{:else}
	<button />

	<div>
		<div class="w-full h-20 p-4 mb-8">
			<div class=" border-2 rounded-lg border-orange-500">
				<div
					class="w-full h-8 border-b-2 border-orange-500 bg-orange-500 text-white text-xl font-bold text-center"
				>
					Penjualan
				</div>
				<div class="grid grid-cols-2 w-full h-12 mt-2">
					<div class="ml-2 text-xs text-left">order ID :<b> {$n_order.id}</b></div>
					<div class="ml-2 text-xs text-left">Pelanggan :<b> {$n_order.pelanggan.nama}</b></div>
					<div class="ml-2 text-xs text-left">
						Untuk:<b>{getTanggal($n_order.waktuKirim)} {getJam($n_order.waktuKirim)}</b>
					</div>
					<div class="ml-2 text-xs text-left">
						Jenis Order: <b>
							{#if $n_order.jenisOrder === 'DiWarung'}
								Meja {$n_order.meja}
							{:else}
								{$n_order.jenisOrder}
							{/if}
						</b>
					</div>
				</div>
			</div>
		</div>

		{#if menuItem}
			<div class="max-h-88 w-full p-4 overflow-y-auto">
				{#each menuItem as item, index}
					<div class="grid grid-cols-8 px-4 h-12 border-b-2">
						<div class="align-middle text-left pt-2">{item.jml}</div>
						<button
							on:click={() => {
								tambahItemClick(index);
							}}
							class="col-span-4 border-none text-left"
						>
							{item.nama}
							<div class="text-xs">
								Stok:
								{#if item.stok === -1}
									-
								{:else}
									{item.stok}
								{/if}
							</div>
						</button>
						<button
							on:click={() => {
								hapusItemOrder(index);
							}}
							class="w-full h-full flex justify-center"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="#000000"
								stroke-width="1"
								stroke-linecap="round"
								stroke-linejoin="round"
								><polyline points="3 6 5 6 21 6" /><path
									d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
								/><line x1="10" y1="11" x2="10" y2="17" /><line
									x1="14"
									y1="11"
									x2="14"
									y2="17"
								/></svg
							>
						</button>

						<div class="col-span-2 text-right">
							{rupiah(item.jml * item.harga)}
						</div>
					</div>
				{/each}
				
			</div>
			{#if $n_order.totalTagihan !== 0}
					<div class="grid grid-cols-8 px-4 h-8 mt-2">
						<div class="col-span-4" />
						<div class="col-span-2 font-semibold border-b-2">Total</div>
						<div class="col-span-2 font-bold border-b-2 text-right">
							{rupiah($n_order.totalTagihan)}
						</div>
					</div>

					<div class="grid grid-cols-8 px-4 h-8">
						<button on:click={() => hapusSemua()}
							><svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="#000000"
								stroke-width="1"
								stroke-linecap="round"
								stroke-linejoin="round"
								><polyline points="3 6 5 6 21 6" /><path
									d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
								/><line x1="10" y1="11" x2="10" y2="17" /><line
									x1="14"
									y1="11"
									x2="14"
									y2="17"
								/></svg
							>
							<div class="text-xs font-mono">Batal</div>
						</button>
						<div class="col-span-3 px-4">
							{#if bayarOpen === false}
							<button
								on:click={() => btnSimpanPenjualan()}
								class="w-full h-full border rounded-lg text-center text-white font-bold bg-orange-500"
								>Simpan</button
							>
							{/if}
						</div>
						<div class="col-span-2 font-semibold border-b-2">Bayar</div>
						<button class="col-span-2 border-b-2 w-full text-right">{rupiah(totalBayar)}</button>
						<Dropdown bind:open={bayarOpen}>
							<div class="grid grid-cols-5 gap-2 border-gray-800 bg-gray-100 p-2">
								<DropdownItem class="col-span-5 w-full border-b border-black justify-end">
									<div class="grid grid-cols-5">
										<div class="col-span-3 text-right">Kembalian:</div>
										<div class="col-span-2 text-right font-bold">
											{rupiah(totalBayar - $n_order.totalTagihan)}
										</div>
									</div>
								</DropdownItem>

								<DropdownItem
									on:click={() => {
										totalBayar += 2000;
									}}
									class="border border-gray-400 rounded-lg">2.000</DropdownItem
								>
								<DropdownItem
									on:click={() => {
										totalBayar += 5000;
									}}
									class="border border-gray-400 rounded">5.000</DropdownItem
								>
								<DropdownItem
									on:click={() => {
										totalBayar += 10000;
									}}
									class="border border-gray-400 rounded">10rb</DropdownItem
								>
								<DropdownItem
									on:click={() => {
										totalBayar += $n_order.totalTagihan;
									}}
									class="border border-gray-400 rounded">Pas</DropdownItem
								>
								<DropdownItem
									on:click={() => {
										totalBayar = 0;
									}}
									class="border border-gray-400 rounded">Hapus</DropdownItem
								>
								<DropdownItem
									on:click={() => {
										totalBayar += 20000;
									}}
									class="border border-gray-400 rounded">20rb</DropdownItem
								>
								<DropdownItem
									on:click={() => {
										totalBayar += 50000;
									}}
									class="border border-gray-400 rounded">50rb</DropdownItem
								>
								<DropdownItem
									on:click={() => {
										totalBayar += 100000;
									}}
									class="border border-gray-400 rounded">100rb</DropdownItem
								>
								<DropdownItem
									on:click={() => bayarClick()}
									class="col-span-2 w-full border bg-orange-500 text-white rounded text-center"
									>Simpan</DropdownItem
								>
							</div>
						</Dropdown>
					</div>
				{/if}
		{/if}
	</div>

	<Dropdown
		{placement}
		bind:open={pelangganOpen}
		triggeredBy="#btnPelanggan"
		class="w-40 h-96 overflow-y-auto bg-slate-100"
	>
		{#if $dataPelanggan}
			{#each $dataPelanggan as pelanggan, index}
				<DropdownItem on:click={() => pelangganClick(pelanggan)} class="border-b-2 border-slate-300"
					>{pelanggan.nama}</DropdownItem
				>
			{/each}
		{/if}
	</Dropdown>

	<Dropdown {placement} bind:open={orderOpen} triggeredBy="#btnOrder" class="w-32 bg-slate-100">
		{#each orderList as order}
			<DropdownItem
				on:click={() => orderListClick(order)}
				class="flex items-center justify-between"
			>
				{#if order === 'DiWarung'}
					<Chevron placement="left">{order}</Chevron>
				{:else}
					{order}
				{/if}
			</DropdownItem>
			{#if order === 'DiWarung'}
				<Dropdown
					placement="left-end"
					bind:open={mejaOpen}
					class="grid grid-cols-2 w-48 h-96 p-4 overflow-y-auto "
				>
					{#each mejaCount as meja}
						<DropdownItem on:click={() => mejaClick(meja)}>
							<Avatar size="sm" src="meja.png" rounded />
							<div class="text-xs">Meja {meja}</div>
						</DropdownItem>
					{/each}
				</Dropdown>
			{/if}
		{/each}
	</Dropdown>

	<Dropdown
		{placement}
		bind:open={menuOpen}
		triggeredBy="#btnMenu"
		class="w-72 h-3/4 grid grid-cols-2 gap-2 p-4 overflow-y-auto bg-slate-100"
	>
		{#if $dataMenuStore}
			{#each $dataMenuStore as menu, index}
				<Card class="h-24 w-full ">
					<button on:click={() => pilihMenuClick(menu)} class="flex flex-col items-center">
						<Avatar size="sm" src="lb1.jpeg" rounded />
						<div class="text-xs font-medium text-gray-900 dark:text-white">{menu.nama}</div>
						<span class="mb-2 text-xs text-gray-500 dark:text-gray-400">{rupiah(menu.harga)}</span>
					</button>
				</Card>
			{/each}
		{/if}
	</Dropdown>
{/if}
