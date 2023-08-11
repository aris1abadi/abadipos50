<script>
 
	import '../app.css';
	import { Modal } from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import { io } from '$lib/realtime';
	import Header from '$lib/Header.svelte';

	import {
		BottomNav,
		Dropdown,
		DropdownItem,
		Chevron,
		BottomNavItem,
		DropdownDivider
	} from 'flowbite-svelte';

	import {
		displayMode,
		n_order,
		transaksiBeliCount,
		transaksiJualCount,
		dataMenuStore,
		dataBahanStore,
		dataPelanggan,
		dataKategoriMenu,
		dataKategoriBahan,
		dataKategoriUser,
		dataSuplier,
		n_beli,
		dataSatuan,
		firstLoad,
		headerContent


	} from '$lib/stores/store';

	
	import { goto } from '$app/navigation';
	import { sendToServer, bikinIdTransaksi } from '$lib/myFunction';

	let modalOpen = false;

	let qrcode_src = '';
	let qrShow = false;

	let homeOpen = false;

	onMount(() => {
		
		
		io.on('qr', (msg) => {
			qrcode_src = msg;
			qrShow = true;
			modalOpen = true;
			console.log('QRCode ', qrcode_src);
		});
		io.on('waReady', (msg) => {
			qrShow = false;
			modalOpen = false;
		});

		if ($dataMenuStore.length === 0) {
			sendToServer('getMenu');
		}

		if ($dataBahanStore.length === 0) {
			sendToServer('getBahan');
		}

		if ($dataPelanggan.length === 0) {
			sendToServer('getPelanggan');
		}

		if ($dataSuplier.length === 0) {
			sendToServer('getSuplier');
		}

		if ($dataKategoriMenu.length === 0) {
			sendToServer('getKategori');
		}

		io.on('myMenu', (msg) => {
			if (typeof $dataMenuStore !== 'undefined' && $dataMenuStore.length > 0) {
				$dataMenuStore.forEach((menu, index) => {
					$dataMenuStore[index].stok = msg[index].stok;
				});
			} else {
				$dataMenuStore = [];
				msg.forEach(
					(
						/** @type {{ id: string;gambar:string; waId:string;nama: string; harga: number; stok: any; stokId: any; kategori: Text }} */ menu
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
				//console.log('Menu', $dataMenuStore);
			}
		});

		io.on('myBahan', (msg) => {
			$dataBahanStore = msg;

			//console.log('update bahan: ', $dataBahanStore);
		});

		io.on('myPelanggan', (msg) => {
			$dataPelanggan = msg;
			//console.log('pelanggan: ', $dataPelanggan);
			$n_order.pelanggan = $dataPelanggan[0];			
			
		});

		io.on('mySuplier', (msg) => {
			$dataSuplier = msg;
			//console.log('suplier: ', $dataSuplier);
			$n_beli.suplier = $dataSuplier[11];
		});

		io.on('myKategori', (msg) => {
			$dataKategoriMenu = msg[0].menu;
			$dataKategoriBahan = msg[0].bahan;
			$dataKategoriUser = msg[0].user;
			$dataSatuan = msg[0].satuan;
			//console.log("kategori ",msg)
			//console.log("kategori menu ",$dataKategoriMenu)
		});

		io.on('myTransaksiJualCount', (msg) => {
			$transaksiJualCount = msg;
			$n_order.id = bikinIdTransaksi('J', msg);
			//bikinIdTransaksiJual();
			//$n_order._id = $idTransaksiJual;
			//console.log('transaksiJualcount: ' + $transaksiJualCount);
		});

		io.on('myTransaksiBeliCount', (msg) => {
			$transaksiBeliCount = msg;
			$n_beli.id = bikinIdTransaksi('B', msg);
			//bikinIdTransaksiJual();
			//$n_order._id = $idTransaksiJual;
			//console.log('transaksiJualcount: ' + $transaksiJualCount);
		});
	});

	
</script>

<div class="h-screen w-screen flex justify-center bg-white">
	<div class="h-full w-full max-w-2xl   bg-white">
		<Modal title="Setup" bind:open={modalOpen} outsideclose>
			<div>WA QRCODE</div>
			<div class="flex justify-center">
				<img class="w-100 h-100 mt-10" src={qrcode_src} alt="QR Code" />
			</div>
		</Modal>
		{#if !$firstLoad}
		<Header />
		{/if}
		<slot><!-- optional fallback --></slot>
		
	</div>
</div>
