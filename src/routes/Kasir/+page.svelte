<script>
	// @ts-nocheck

	import { onMount } from "svelte";

	import {
		dataMenuStore,
		transaksiJualCount,
		dataTransaksiJual,
		n_order,
		newOrder,
		dataPelanggan,
		firstLoad,
		dataKategoriMenu,
		newPelangganGlobal,
	} from "$lib/stores/store.js";
	import { goto } from "$app/navigation";
	import { tick } from "svelte";
	import { io } from "$lib/realtime";
	import { bikinIdTransaksi, rupiah } from "$lib/myFunction";
	import { headerContent } from "$lib/stores/store";
	// @ts-ignore
	import { Dropdown, Avatar, DropdownItem, Drawer } from "flowbite-svelte";
	import { sineIn } from "svelte/easing";
	import { notifications } from "$lib/notifications.js";

	let loginProgress, loginSwipeable, introProgress, zoomOut;
	tick().then(() => (zoomOut = true));

	//let displayMode = 'penjualan'; //menu & antrian,penjualan,pembayaran
	let imgdef = "/kopi1.jpeg";
	let mejaImg = "/meja.png";

	/**
	 * @type {any[]}
	 */

	let mejaCount = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

	let menuItem = [];
	let menuHide = true;
	let kategoriNow = $dataKategoriMenu[0];

	let transitionParams = {
		y: 320,
		duration: 200,
		easing: sineIn,
	};

	//let waktuOrder = String(new Date());

	let waktuOrder = $n_order.waktuOrder;
	//let padPesenanShow = false;
	//----------------------------------
	onMount(() => {
		//initTE({ Datepicker, Input });
		menuItem = [];
		if ($firstLoad) {
			goto("/");
			$headerContent.mode = "Home";
		} else {
			$headerContent.mode = "Kasir";
		}

		//kirimKeServer('getMenu');

		if ($newOrder) {
			kirimKeServer("getTransaksiJualCount");
			hapusOrder();
		} else {
			$n_order.item.itemDetil.forEach((item, index) => {
				$dataMenuStore.forEach((menu, idx) => {
					if (item.id === menu.id) {
						//update data stok
						let newData = {
							id: item.id,
							stokId: menu.stokId,
							nama: item.nama,
							harga: item.harga,
							jml: item.jml,
							stok: menu.stok,
							isReady: item.isReady,
						};
						menuItem.push(newData);
					}
				});
			});
		}
		io.on("myMenu", (msg) => {
			if (menuItem.length > 0) {
				msg.forEach((menu) => {
					menuItem.forEach((item, index) => {
						if (item.stokId === menu.stokId) {
							menuItem[index].stok = menu.stok;
						}
					});
				});
			}
		});

		io.on("paymentStatus", (msg) => {
			console.log(msg);
		});

		io.on("myTransaksiJual", (msg) => {
			$dataTransaksiJual = msg;
		});

		io.on("myTransaksiJualCount", (msg) => {
			$transaksiJualCount = msg;
			$n_order.id = bikinIdTransaksi("J", $transaksiJualCount);
			$headerContent.idTransaksi = $n_order.id;
			//console.log('id transaksi jual: ' + $n_order.id);
		});

		io.on("myStok", (msg) => {
			//console.log(msg);
			$dataMenuStore.forEach((mn, index) => {
				$dataMenuStore[index].stok = msg[index];
			});
		});

		//$n_order.pelanggan = $dataPelanggan[0];
	});

	function kirimKeServer(msg = "") {
		io.emit("fromClient", msg);
	}

	function hapusOrder() {
		$n_order.id = bikinIdTransaksi("J", $transaksiJualCount);
		$n_order.pelanggan = $dataPelanggan[0];
		$n_order.jenisOrder = "Bungkus";
		$n_order.meja = 1;
		$n_order.alamatKirim = "";
		$n_order.map = "";
		$n_order.waktuOrder = Date.now();
		$n_order.waktuKirim = Date.now();
		$n_order.status = "open";
		$n_order.totalItem = 0;
		$n_order.totalBayar = 0;
		$n_order.totalTagihan = 0;
		$n_order.item = [];

		$newOrder = true;
	}
	function updateLocalStok(stokId, stok) {
		$dataMenuStore.forEach((menu, index) => {
			if (menu.stokId === stokId) {
				$dataMenuStore[index].stok = stok;
			}
		});
		
		//menuItem.forEach((item, index) => {
		//	if (item.stokId === stokId) {
		//		menuItem[index].stok = stok;
		//	}
		//});
	}

	function pilihMenuClick(menu) {
		//tesTxt = JSON.stringify(menu)
		let newItem = {
			id: "",
			stokId: "",
			nama: "",
			harga: 0,
			jml: 0,
			stok: 0,
		};
		menuHide = true;
		if (menuItem.length > 0) {
			let isSama = false;
			menuItem.forEach((item, index) => {
				if (item.id === menu.id) {
					isSama = true;
					menuItem[index].jml += 1;
					if (menuItem[index].stokId !== "-") {
						menuItem[index].stok -= 1;
						updateLocalStok(
							menuItem[index].stokId,
							menuItem[index].stok,
							
						);
					}
				}
			});
			if (!isSama) {
				newItem.id = menu.id;
				newItem.nama = menu.nama;
				newItem.harga = menu.harga;
				newItem.stokId = menu.stokId;
				newItem.jml = 1;
				if (menu.stokId !== "-") {
					newItem.stok = menu.stok - 1;
					updateLocalStok(menu.stokId, newItem.stok);
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
			newItem.stokId = menu.stokId;
			newItem.jml = 1;

			if (menu.stokId !== "-") {
				newItem.stok = menu.stok - 1;
				updateLocalStok(menu.stokId, newItem.stok);
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
		if (menuItem[idx].stokId !== "-") {
			menuItem[idx].stok += 1;
			updateLocalStok(menuItem[idx].stokId, menuItem[idx].stok);
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
		if (menuItem[idx].stokId !== "-") {
			menuItem[idx].stok -= 1;
			updateLocalStok(menuItem[idx].stokId, menuItem[idx].stok);
		}
		menuItem[idx].jml += 1;
		menuItem[idx].isReady = false;
		//console.log(menuItem[idx])

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

	let totalBayar = 0;

	function simpanTransaksi() {
		let simpanItem = [];
		menuItem.forEach((menu) => {
			let dt = {
				id: menu.id,
				stokId: menu.stokId,
				nama: menu.nama,
				harga: menu.harga,
				jml: menu.jml,
				isReady: menu.isReady,
			};
			simpanItem.push(dt);
		});

		let itemNow = {
			time: Date.now(),
			itemDetil: simpanItem,
		};
		$n_order.item = itemNow;
		//console.log('simpan ', $n_order);
		if ($newOrder) {
			io.emit("simpanTransaksiJual", $n_order);
		} else {
			io.emit("updateTransaksiJual", $n_order);
		}
		let msg = "Transaksi ";
		msg += $n_order.id;
		msg += " Disimpan";
		notifications.success("Penjualan", msg, 2000);
	}

	function btnSimpanPenjualan() {
		simpanTransaksi();
		hapusSemua();
	}

	function hapusSemua() {
		menuItem = [];
		$n_order.totalTagihan = 0;
		$n_order.totalItem = 0;
		hapusOrder();
	}
	let bayarOpen = false;

	function bayarClick() {
		if (totalBayar + $n_order.totalBayar >= $n_order.totalTagihan) {
			$n_order.totalBayar = $n_order.totalTagihan;
		} else {
			$n_order.totalBayar += totalBayar;
		}
		bayarOpen = false;
		//simpan pembayaran
		btnSimpanPenjualan();
	}

	let timeSelect = Date.now();

	function ambilClick() {
		if (totalBayar + $n_order.totalBayar >= $n_order.totalTagihan) {
			$n_order.totalBayar = $n_order.totalTagihan;
			bayarOpen = false;
			simpanTransaksi();
			io.emit("closeTransaksiJual", $n_order);
			//sendToServer('getTransaksiJualOpen');
			hapusSemua();
		}
	}
</script>

{#if $dataMenuStore.length > 0 && $dataPelanggan.length > 0}
	<div>
		<div class="max-h-80 w-full p-4 overflow-y-auto">
			{#each menuItem as item, index}
				<div class="grid grid-cols-8 pl-4 h-12 border-b-2">
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
							{#if item.stokId === "-"}
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
						class="w-full h-full flex justify-center pt-2"
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

					<div class="col-span-2 text-right pt-2">
						{rupiah(item.jml * item.harga)}
					</div>
				</div>
			{/each}
		</div>

		{#if $n_order.totalTagihan !== 0}
			<div class="grid grid-cols-8 px-4 h-8 mb-2">
				<div class="col-span-1" />
				<div class="col-span-5 text-left border-b-2">
					Tagihan(-DP{$n_order.totalBayar})
				</div>
				<div class="col-span-2 font-bold border-b-2 text-right">
					{rupiah($n_order.totalTagihan - $n_order.totalBayar)}
				</div>
			</div>

			<div class="grid grid-cols-8 px-4 h-8 mb-8">
				<button on:click={() => hapusSemua()}>
					<div class="flex justify-center">
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
					</div>
					<div class="text-xs font-mono">Batal</div>
				</button>
				<div class="col-span-3 px-4">
					{#if bayarOpen === false}
						<button
							on:click={() => btnSimpanPenjualan()}
							class="w-full h-full border text-center text-white font-bold bg-orange-500"
							>Simpan</button
						>
					{/if}
				</div>
				<button class="col-span-4 border border-orange-500">
					<div class="grid grid-cols-2 p-2">
						<div class="font-semibold text-left">Bayar</div>
						<div class="text-right">{rupiah(totalBayar)}</div>
					</div>
				</button>

				<Dropdown bind:open={bayarOpen}>
					<div
						class="grid grid-cols-5 gap-2 border-gray-800 bg-gray-100 p-2"
					>
						<DropdownItem
							class="col-span-5 w-full h-16 border-b border-black justify-end"
						>
							<div class="grid grid-cols-6 w-full h-full">
								<div class="col-span-2 w-full h-full">
									{#if totalBayar >= $n_order.totalTagihan - $n_order.totalBayar}
										<button
											on:click={() => ambilClick()}
											class="w-full h-full rounded bg-orange-500 text-white"
											>Ambil</button
										>
									{/if}
								</div>
								<div class="col-span-2 text-right">
									Kembalian:
								</div>
								<div class="col-span-2 text-right font-bold">
									{rupiah(
										totalBayar -
											($n_order.totalTagihan -
												$n_order.totalBayar)
									)}
								</div>
							</div>
						</DropdownItem>

						<DropdownItem
							on:click={() => {
								totalBayar += 2000;
							}}
							class="border border-gray-400 rounded-lg"
							>2.000</DropdownItem
						>
						<DropdownItem
							on:click={() => {
								totalBayar += 5000;
							}}
							class="border border-gray-400 rounded"
							>5.000</DropdownItem
						>
						<DropdownItem
							on:click={() => {
								totalBayar += 10000;
							}}
							class="border border-gray-400 rounded"
							>10rb</DropdownItem
						>
						<DropdownItem
							on:click={() => {
								totalBayar +=
									$n_order.totalTagihan - $n_order.totalBayar;
							}}
							class="border border-gray-400 rounded"
							>Pas</DropdownItem
						>
						<DropdownItem
							on:click={() => {
								totalBayar = 0;
							}}
							class="border border-gray-400 rounded"
							>Hapus</DropdownItem
						>
						<DropdownItem
							on:click={() => {
								totalBayar += 20000;
							}}
							class="border border-gray-400 rounded"
							>20rb</DropdownItem
						>
						<DropdownItem
							on:click={() => {
								totalBayar += 50000;
							}}
							class="border border-gray-400 rounded"
							>50rb</DropdownItem
						>
						<DropdownItem
							on:click={() => {
								totalBayar += 100000;
							}}
							class="border border-gray-400 rounded"
							>100rb</DropdownItem
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
		{#if !$headerContent.jenisOrderOpen && !$headerContent.mejaOpen && !$headerContent.pelangganOpen && !bayarOpen}
			<div class="w-full h-8 grid grid-cols-3">
				<div />
				<button
					on:click={() => (menuHide = !menuHide)}
					class="flex justify-right w-full h-8 ml-4 animate-bounce"
				>
					<div
						class="h-6 w-6 rounded rounded-2xl bg-orange-500 flex justify-center items-center"
					>
						<svg
							class="w-4 h-4 text-white"
							fill="white"
							viewBox="0 0 20 20"
							xmlns="http://www.w3.org/2000/svg"
							aria-hidden="true"
						>
							<path
								clip-rule="evenodd"
								fill-rule="evenodd"
								d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
							/>
						</svg>
					</div>
					<div class="text-center ml-2">Tambah</div>
				</button>
				<div />
			</div>
		{:else}
			<div class="w-full h-8" />
		{/if}
	</div>
{:else}
	<div
		class="border border-orange-500 shadow rounded-md p-4 max-w-sm w-full mx-auto my-10"
	>
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

<Drawer
	placement="bottom"
	transitionType="fly"
	{transitionParams}
	bind:hidden={menuHide}
	id="sidebar2"
	class="w-full max-w-xl h-1/2 bg-gray-100 p-0"
>
	<div class="grid grid-cols-4 px-2 w-full h-8 my-2">
		{#each $dataKategoriMenu as kategori}
			<button
				class={kategoriNow === kategori
					? "text-white bg-orange-500"
					: "text-black bg-white"}
				on:click={() => (kategoriNow = kategori)}>{kategori}</button
			>
		{/each}
	</div>
	<div class="overflow-y-auto w-full h-3/4">
		<div class="grid grid-cols-4 gap-2">
			{#if $dataMenuStore}
				{#each $dataMenuStore as menu, index}
					{#if kategoriNow === menu.kategori}
						<button
							class="bg-white rounded ronded-sm"
							on:click={() => pilihMenuClick(menu)}
						>
							<div class="flex flex-col items-center p-2">
								<img
									class="w-full h-1/2"
									src={menu.gambar}
									alt="gambar"
								/>
								<div
									class="mb-1 text-xs font-medium text-gray-900 dark:text-white"
								>
									{menu.nama}
								</div>
								<span
									class="text-xs text-gray-500 dark:text-gray-400"
									>{rupiah(menu.harga)}r</span
								>
							</div>
						</button>
					{/if}
				{/each}
			{/if}
		</div>
	</div>
</Drawer>
