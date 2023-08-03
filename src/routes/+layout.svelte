<script>
	import '../app.css';
	import { Modal } from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import { io } from '$lib/realtime';

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
		dataSatuan
	} from '$lib/stores/store';

	import Fullscreen from 'svelte-fullscreen';
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
			$dataKategoriMenu = msg[0].menu
			$dataKategoriBahan = msg[0].bahan
			$dataKategoriUser = msg[0].user
			$dataSatuan = msg[0].satuan
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

	let placement = 'top';

	function btnAntrianClick() {
		goto('/Antrian');
	}

</script>

<Fullscreen let:onRequest let:onExit>
	<div class="h-screen w-screen bg-white">
		<div class="h-full w-full max-w-2xl mx-auto bg-white flex flex-col">
			<Modal title="Setup" bind:open={modalOpen} outsideclose>
				<div>WA QRCODE</div>
				<div class="flex justify-center">
					<img class="w-100 h-100 mt-10" src={qrcode_src} alt="QR Code" />
				</div>
			</Modal>

			<slot><!-- optional fallback --></slot>

			<!--on:click={()=>{onRequest();homeOpen = false}}-->
			<Dropdown
				{placement}
				bind:open={homeOpen}
				class="w-32 bg-slate-100 text-xl"
				triggeredBy="#btnHome"
			>
				<DropdownItem
					href="/"
					on:click={() => {
						onRequest();
						homeOpen = false;
					}}>Home</DropdownItem
				>
				<DropdownDivider class="bg-red-500" />
				<DropdownItem
					href="/Kasir"
					on:click={() => {
						onRequest();
						homeOpen = false;
					}}>Penjualan</DropdownItem
				>
				<DropdownDivider />
				<DropdownItem
					href="/Belanja"
					on:click={() => {
						onRequest();
						homeOpen = false;
					}}>Belanja</DropdownItem
				>
				<DropdownDivider />
				<DropdownItem
					href="/Dashboard"
					on:click={() => {
						onRequest();
						homeOpen = false;
					}}>Laporan</DropdownItem
				>
				<DropdownDivider />
				<DropdownItem
					href="/Setup"
					on:click={() => {
						onRequest();
						homeOpen = false;
					}}>Setting</DropdownItem
				>
			</Dropdown>

			<BottomNav position="absolute" navType="application" classInner="grid-cols-5">
				<BottomNavItem
					btnName="Home"
					id="btnHome"
					appBtnPosition="left"
					on:click={() => {
						homeOpen = true;
					}}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="w-6 h-6"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
						/>
					</svg>

					<div class="text-xs">Menu</div>
				</BottomNavItem>
				<BottomNavItem btnName="Wallet" appBtnPosition="middle" on:click={() => btnAntrianClick()}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="w-6 h-6"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
						/>
					</svg>

					<div class="text-xs">Antrian</div>
				</BottomNavItem>
				<button id="btnMenu" class="flex items-center justify-center">
					<BottomNavItem
						btnName="Create new item"
						appBtnPosition="middle"
						btnClass="inline-flex items-center justify-center w-10 h-10 font-medium bg-primary-600 rounded-full hover:bg-primary-700 group focus:ring-4 focus:ring-primary-300 focus:outline-none dark:focus:ring-primary-800"
					>
						<svg
							class="w-6 h-6 text-white"
							fill="currentColor"
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
					</BottomNavItem>
				</button>
				<BottomNavItem btnName="Settings" appBtnPosition="middle" id="btnOrder">
					<svg
						class="w-6 h-6 mb-1 text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-500"
						fill="currentColor"
						viewBox="0 0 20 20"
						xmlns="http://www.w3.org/2000/svg"
						aria-hidden="true"
					>
						<path
							d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z"
						/>
					</svg>
					<div class="text-xs">Order</div>
				</BottomNavItem>
				<BottomNavItem btnName="Profile" appBtnPosition="right" id="btnPelanggan">
					<svg
						class="w-6 h-6 mb-1 text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-500"
						fill="currentColor"
						viewBox="0 0 20 20"
						xmlns="http://www.w3.org/2000/svg"
						aria-hidden="true"
					>
						<path
							clip-rule="evenodd"
							fill-rule="evenodd"
							d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
						/>
					</svg>
					{#if $displayMode === 'Kasir'}
						<div class="text-xs">Pelanggan</div>
					{:else if $displayMode === 'Belanja'}
						<div class="text-xs">Suplier</div>
					{/if}
				</BottomNavItem>
			</BottomNav>
		</div>
	</div>
</Fullscreen>
