<script>
	//import Header from '$lib/Header.svelte';
	import {
		dataMenuStore,
		dataBahanStore,
		dataTransaksiJual,
		transaksiJualCount,
		dataPelanggan,
		dataSuplier
		

	} from '$lib/stores/store.js';
	import { io } from '$lib/realtime';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	//import { faUser, faSave, faTrashCan } from '@fortawesome/free-regular-svg-icons';
	import { bikinIdTransaksi,sendToServer } from '$lib/myFunction.js';

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

		sendToServer('getMenu');

		sendToServer('getTransaksiJual');		
		sendToServer('getTransaksiJualCount');
		sendToServer('getPelanggan');
		sendToServer('getSuplier');

		io.on('myMenu', (msg) => {
			//$dataMenuStore = msg;
			$dataMenuStore = [];
			msg.forEach((/** @type {{ id: any; nama: any; harga: any; stok: any; resepId: any; }} */ menu) => {
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
			console.log($dataMenuStore);
		});

		io.on('myTransaksiJual', (msg) => {
			$dataTransaksiJual = msg;
		});

		io.on('myTransaksiJualCount', (msg) => {
			$transaksiJualCount = msg;
			//bikinIdTransaksiJual();
			//$n_order._id = $idTransaksiJual;
			//console.log('transaksiJualcount: ' + $transaksiJualCount);
		});

		io.on('myPelanggan', (msg) => {
			$dataPelanggan = msg;
		});

		io.on('mySuplier', (msg) => {
			$dataSuplier = msg;
		});


		io.on('myCloseTransaksiNow', (msg) => {
			closeTransaksiNow = msg;
			//console.log(msg)
			$dataMenuStore.forEach((menu, index) => {
				closeTransaksiNow.forEach((tn) => {
					tn.item.forEach((/** @type {{ itemDetil: any[]; }} */ item) => {
						item.itemDetil.forEach((/** @type {{ id: any; jml: any; harga: any; }} */ detil) => {
							if (detil.id === menu.id) {
								jmlTransaksi[index] += detil.jml;
								hargaTransaksi[index] = detil.harga;
							}
						});
					});
				});
			});
			jmlTransaksi.forEach((jml, index) => {
				totalPenjualan += jml * hargaTransaksi[index];
			});
		});
	});

	
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="pos app" />
</svelte:head>

<div class=" w-full h-1/2 grid grid-cols-3" >
	<div></div>
	<img src="logo2023.png" alt="Logo lesehanpundong" class="w-full h-1/2 mt-20"/>
	<div></div>	
	
</div>
<div class="text-2xl font-bold text-center">0822 6528 5223</div>
