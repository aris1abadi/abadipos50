<script>
	// @ts-nocheck

	//import Header from '$lib/Header.svelte';
	import {
		dataMenuStore,
		dataBahanStore,
		dataTransaksiJual,
		transaksiJualCount,
		n_beli,
		dataPelanggan,
		firstLoad,
		headerContent,
		totalHutang,
		totalClick
	} from "$lib/stores/store.js";
	import { io } from "$lib/realtime";
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";
	import Pad from "$lib/Pad.svelte";

	//import { faUser, faSave, faTrashCan } from '@fortawesome/free-regular-svg-icons';
	import { sendToServer, rupiah, getWaktu, getTanggal,getJam } from "$lib/myFunction.js";
	import Header from "$lib/Header.svelte";
	import { Dropdown, Avatar, DropdownItem, Drawer } from "flowbite-svelte";
	import { sineIn } from "svelte/easing";

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

	let lastHutang = null;
	let lastWeekHutang = null;

	let bayarOpen = false;
	let padMode = false;
	let padVal = 0;

	onMount(() => {
		//sendToServer('getMenu');
		//sendToServer('getBahan');
		if ($firstLoad) {
			$headerContent.mode = "Home";
			goto("/");
			
			sendToServer("getMenu");
			sendToServer("getBahan");
		}

		//sendToServer('getTransaksiJual');
		//sendToServer('getCloseTransaksiNow');
		//sendToServer('getTransaksiBeliNow');
		//sendToServer('getTransaksiJualCount');
		//sendToServer('getPelanggan');

		$dataMenuStore.forEach((menu) => {
			jmlTransaksi.push(0);
			hargaTransaksi.push(0);
		});

		$dataBahanStore.forEach((menu) => {
			jmlTransaksiBeli.push(0);
			hargaTransaksiBeli.push(0);
		});

		io.on("myCloseTransaksiNow", (msg) => {
			closeTransaksiNow = msg;
			console.log("Close transaksi ", msg);
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
			totalPenjualan = 0;
			jmlTransaksi.forEach((jml, index) => {
				totalPenjualan += jml * hargaTransaksi[index];
			});
			//console.log("Jumlah transaksi ",jmlTransaksi)
		});

		io.on("myTransaksiBeliNow", (msg) => {
			transaksiBeliNow = msg;
			//console.log('transaksi beli ', msg);
			jmlTransaksiBeli.forEach((tr, index) => {
				jmlTransaksiBeli[index] = 0;
			});
			$dataBahanStore.forEach((bahan, index) => {
				transaksiBeliNow.forEach((bhn) => {
					bhn.item.forEach((item) => {
						if (item.id === bahan.id) {
							//console.log("Item detil: ",detil)
							jmlTransaksiBeli[index] += item.jml;
							hargaTransaksiBeli[index] = item.harga;
						}
					});
				});
			});
			totalPembelian = 0;
			jmlTransaksiBeli.forEach((jml, index) => {
				totalPembelian += jml * hargaTransaksiBeli[index];
			});
		});

		io.on("lastHutang", (msg) => {
			console.log("LastHutang: " + JSON.stringify(msg));
			lastHutang = msg;
			if (lastHutang === null) {
				bayarOpen = false;
			}
		});

		//lastWeekHutang
		io.on("lastWeekHutang", (msg) => {
			//console.log("LastWeekHutang: " + JSON.stringify(msg));
			lastWeekHutang = msg;
			//cek total Hutang
			if (lastWeekHutang.length > 0) {
				for (let i = 0; i < lastWeekHutang.length; i++) {
					if (lastWeekHutang[i].status === "last") {
						$totalHutang = lastWeekHutang[i].newHutang;
						//console.log("total hutang: " + $totalHutang);
					}
				}
			}else{
				$totalHutang = 0
				//console.log("total hutang: " + $totalHutang);
			}
		});
	});

	let totalBayar = 0;

	function bayarHutangClick() {}

	function lastWeekHistoryClick() {
		io.emit("getLastWeekHutang", $n_beli.suplierId);
	}
</script>


<div class=" w-full h-full mt-8 px-2 overflow-y-auto">
	<div class="grid grid-cols-2 px-1">
		<div class="text-right font-bold font-mono mr-4">Bayar</div>
		<button on:click={() => {bayarOpen = !bayarOpen}} class="border h-full w-full "><div class="font-bold  text-right mr-2">{rupiah(totalBayar)}</div></button>
	</div>
	<Dropdown bind:open={bayarOpen}>
		<div class="grid grid-cols-5 gap-2 border-gray-800 bg-gray-100 p-2">
			

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
					totalBayar = $totalHutang;
				}}
				class="border border-gray-400 rounded">Pas</DropdownItem
			>
			<DropdownItem
				on:click={() => {
					totalBayar = 0;
				}}
				class="border border-gray-400 text-center rounded">Hapus</DropdownItem
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
				on:click={() => bayarHutangClick()}
				class="col-span-2 w-full border bg-orange-500 text-white rounded text-center"
				>Simpan</DropdownItem
			>
		</div>
	</Dropdown>
	<div class="grid grid-cols-3 text-xs font-mono px-2">
		{#if lastWeekHutang}
			{#each lastWeekHutang as hutang, index}
				<div>{getTanggal(hutang.waktu)}</div>
				<div>Hutang</div>
				<div class="text-right">{rupiah(hutang.lastHutang)}</div>

				<div>{getJam(hutang.waktu)}</div>
				<div>Tagihan</div>
				<div class="text-right">{rupiah(hutang.totalTagihan)}</div>

				<div />
				<div>Bayar</div>
				<div class="text-right">{rupiah(hutang.totalBayar)}</div>

				<hr class="col-span-3 " />
			{/each}
		{/if}
	</div>

	
</div>
