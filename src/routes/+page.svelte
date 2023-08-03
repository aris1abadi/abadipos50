<script>
	//import Header from '$lib/Header.svelte';
	import {
		dataMenuStore,
		dataBahanStore,
		dataTransaksiJual,		
		firstLoad,
		n_order

	} from '$lib/stores/store.js';
	import { io } from '$lib/realtime';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	//import { faUser, faSave, faTrashCan } from '@fortawesome/free-regular-svg-icons';
	import { bikinIdTransaksi, sendToServer } from '$lib/myFunction.js';

	//import { Datepicker, Input, initTE } from "tw-elements";

	/**
	 * @type {any[]}
	 */
	let closeTransaksiNow = [];
	/**
	 * @type {any[]}
	 */
	let jmlTransaksi = [];
	/**
	 * @type {number[]}
	 */
	let hargaTransaksi = [];
	let transaksiNumber = 0;
	let totalPenjualan = 0;

	onMount(() => {
		transaksiNumber = 0;

		if ($dataMenuStore.length === 0) {
			sendToServer('getMenu');
		}
		//sendToServer('getTransaksiJual');
		//sendToServer('getTransaksiJualCount');
		//sendToServer('getPelanggan');
		//sendToServer('getSuplier');
		//sendToServer('getKategori');
/*
		io.on('myMenu', (msg) => {
			//$dataMenuStore = msg;
			$dataMenuStore = [];
			msg.forEach(
				(
					 menu
				) => {
					let dt = {
						id: menu.id,
						nama: menu.nama,
						harga: menu.harga,
						stok: menu.stok,
						waId: menu.waId,
						stokId: menu.stokId,
						orderCount: 0,
						kategori: menu.kategori,
						stokUse: 0,
						gambar: menu.gambar
					};
					$dataMenuStore.push(dt);
					
				}
			);
			//console.log($dataMenuStore);
		});
		*/

		jmlTransaksi=[]
		hargaTransaksi=[]
		$dataMenuStore.forEach(menu =>{
			jmlTransaksi.push(0);
			hargaTransaksi.push(0);
		})

		

		io.on('myTransaksiJual', (msg) => {
			$dataTransaksiJual = msg;
		});

		

		
		io.on('myCloseTransaksiNow', (msg) => {
			closeTransaksiNow = msg;
			//console.log(msg)
			$dataMenuStore.forEach((menu, index) => {
				closeTransaksiNow.forEach((tn) => {
					tn.item.itemDetil.forEach((/** @type {{ id: any; jml: any; harga: any; }} */ detil) => {
						if (detil.id === menu.id) {
							jmlTransaksi[index] += detil.jml;
							hargaTransaksi[index] = detil.harga;
						}
					});
				});
			});
			jmlTransaksi.forEach((jml, index) => {
				totalPenjualan += jml * hargaTransaksi[index];
			});
		});
	});

	function mulaiClick(){
		$firstLoad = false
		goto("/Kasir")
	}
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="pos app" />
</svelte:head>

<div class=" w-full h-1/2 flex justify-center">
	
	<img src="logo2023.png" alt="Logo lesehanpundong" class="w-48 h-48 mt-20" />
	
	
</div>
<div class="text-2xl font-bold text-center">0822 6528 5223</div>
<div class="flex justify-center">
	<button on:click={() =>mulaiClick()} class="w-1/2 h-12 border border-orange-500 text-xl text-orange-500">Mulai Jualan</button>
</div>

