<script>
	// @ts-nocheck

	import { onMount } from 'svelte';
	import {
		dataBahanStore,
		dataSuplier,
		n_beli,		
		headerContent,
		newBahanGlobal,
		dataMenuStore,
		firstLoad,
		dataKategoriBahan

	} from '$lib/stores/store.js';
	import { io } from '$lib/realtime';

	import { sendToServer, rupiah } from '$lib/myFunction.js';
	import { goto } from '$app/navigation';
	import Pad from '$lib/Pad.svelte';
	import { sineIn } from 'svelte/easing';

	import { bikinIdTransaksi, isEmpty, getJam, getTanggal } from '$lib/myFunction.js';

	// @ts-ignore

	import { Dropdown, Avatar, DropdownItem, Drawer} from 'flowbite-svelte';
	/**
	 * @type {any[]}
	 */
	let bahanItem = [];

	//let bahanVal = []
	let padShow = [];
	let padMode= []
	let padVal = 0
	let bahanHide = true
	let belanjaOpen = false
	
	//let transaksiBeliCountNow = 1;
	let totalBayar = 0;
	let kategoriNow = $dataKategoriBahan[0];

	let transitionParams = {
		y: 320,
		duration: 200,
		easing: sineIn
	};

	onMount(() => {
		
		sendToServer('getTransaksiBeliCount');
		
		if ($firstLoad) {
			goto('/');
			$headerContent.mode = 'Home';
		} else {
			$headerContent.mode = 'Belanja';
		}

		hapusSemua();

		if($dataBahanStore.length > 0){
			padShow = []
			padMode = []
			let padSts = false
			let padMd = false
			$dataBahanStore.forEach(bahan =>{
				padShow.push(padSts);
				padMode.push(padMd)
			})
		}
		//newItemNama = $dataBahanStore[0].nama;
		//newItemHarga = $dataBahanStore[0].harga;
		//$headerContent.bahanSrc = $dataBahanStore;

		io.on('myTransaksiBeliCount', (msg) => {
			$n_beli.id = bikinIdTransaksi('B', msg);
			
		});

	
	});

	

	/**
	 * @param {number} idx
	 */

	function updateTotal() {
		$n_beli.totalItem = 0;
		$n_beli.totalTagihan = 0;

		bahanItem.forEach((item) => {
			$n_beli.totalItem += item.belanjaCount;
			$n_beli.totalTagihan += item.belanjaCount * item.harga;
		});
	}

	let placement = 'top';
	let bahanOpen = false;

	function pilihBahanClick(bahan) {
		if (bahanItem.length > 0) {
			//cek id
			let isSama = false;
			bahanItem.forEach((item, index) => {
				if (item.id === bahan.id) {
					isSama = true;
					bahanItem[index].belanjaCount += 1;
				}
			});
			if (!isSama) {
				bahan.belanjaCount = 1;
				bahanItem.push(bahan);
			}
		} else {
			bahan.belanjaCount = 1;
			bahanItem.push(bahan);
		}
		updateTotal();
		bahanHide = true;
		bahanItem = bahanItem;
	}

	
	

	let bayarBelanjaOpen = false;

	function btnSimpanBelanja() {
		if ($n_beli.totalTagihan !== 0) {
			let newBahan = [];
			let newItem = {
				id: '',
				nama: '',
				harga: 0,
				jml: 0,
				satuan: '',
				stokId: '',
				konversi: 1,
				user: {}
			};
			bahanItem.forEach((bahan, index) => {
				newItem.id = bahan.id;
				newItem.nama = bahan.nama;
				newItem.harga = bahan.harga;
				newItem.jml = bahan.belanjaCount;
				newItem.satuan = bahan.satuan;
				newItem.stokId = bahan.stokId;
				newItem.konversi = bahan.konversi;
				newItem.user = bahan.user;

				newBahan.push(newItem);
			});

			$n_beli.item = newBahan;

			io.emit('simpanTransaksiBeli', $n_beli);
			//console.log('simpan transaksi beli ', $n_beli);
			belanjaOpen = false
			hapusSemua();
		}
	}

	function hapusSemua() {
		bahanItem = [];
		$n_beli.totalTagihan = 0;
		$n_beli.totalItem = 0;
	}
	let bahanCountOpen = false;

	function padClick(data, idx) {
		if(padMode[idx]){
			bahanItem[idx].harga = padVal
		}else{
			bahanItem[idx].belanjaCount = padVal
		}
		updateTotal()
	}

	function hapusPadClick(data, idx) {
		if(padMode[idx]){
			bahanItem[idx].harga = padVal
		}else{
			bahanItem[idx].belanjaCount = padVal
		}
		updateTotal()
	}

	function enterClick(data, idx) {
		padShow[idx] = false;
		updateTotal()
	}
</script>

{#if (($dataMenuStore.length > 0) && ($dataBahanStore.length > 0) && ($dataSuplier.length > 0))}


<div class="max-h-80 w-full p-4 mt-4  overflow-y-auto bg-white">
	{#if bahanItem.length}
		{#each bahanItem as bahan, index}
			<div class="grid grid-cols-5 w-full h-15 pr-5 mt-2 border-b-2">
				<div class="col-span-4 pt-2 font-mono font-bold text-sm">{index + 1}.{bahan.nama}</div>
				<div class=" py-2 text-right text-sm font-mono font-bold">
					{rupiah(bahan.belanjaCount * bahan.harga)}
				</div>
				<div />
				<button on:click={() =>{padShow[index] = true ;padMode[index] = false;padVal=0}} class={(padShow[index] && !padMode[index])?"bg-orange-100 text-sm":"bg-white text-sm"} >{bahan.belanjaCount} {bahan.satuanBeli}</button>
				<button on:click={() =>{padShow[index] = true ;padMode[index] = true;padVal=0}} class={(padShow[index] && padMode[index])?"bg-orange-100 text-sm col-span-2":"col-span-2 bg-white text-sm"}>{rupiah(bahan.harga)}</button>

				<div />
			
			{#if padShow[index]}
			<div class="col-span-5 mb-2 bg-orange-100">
				<Pad 
					bind:padVal={padVal}
					on:eventPadClick={() => padClick(bahan, index)}
					on:eventHapusPad={() => hapusPadClick(bahan, index)}
					on:eventEnterPad={() => enterClick(bahan, index)}
				/>
				</div>
			{/if}
		</div>
		{/each}
	
	{/if}
</div>
{#if $n_beli.totalTagihan > 0}
<div class="grid grid-cols-8 px-4 h-8 mb-2 mt-4">
	<div class="col-span-1" />
	<div class="col-span-5 text-left border-b-2">
		Tagihan(-DP{$n_beli.totalBayar})
	</div>
	<div class="col-span-2 font-bold border-b-2 text-right">
		{rupiah($n_beli.totalTagihan - $n_beli.totalBayar)}
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
		{#if belanjaOpen === false}
			<button
				on:click={() => btnSimpanBelanja()}
				class="w-full h-full border text-center text-white font-bold bg-orange-500"
				>Simpan</button
			>
		{/if}
	</div>
	<button on:click={() =>belanjaOpen = true} class="col-span-4 border border-orange-500">
		<div class="grid grid-cols-2 p-2">
			<div class="font-semibold text-left">Bayar</div>
			<div class="text-right">{rupiah(totalBayar)}</div>
		</div>
	</button>

	<Dropdown bind:open={belanjaOpen}>
		<div class="grid grid-cols-5 gap-2 border-gray-800 bg-gray-100 p-2">
			<DropdownItem class="col-span-5 w-full h-16 border-b border-black justify-end">
				<div class="grid grid-cols-6 w-full h-full">
					<div class="col-span-2 w-full h-full">
						
					</div>
					<div class="col-span-2 text-right">Kembalian:</div>
					<div class="col-span-2 text-right font-bold">
						{rupiah(totalBayar - ($n_beli.totalTagihan - $n_beli.totalBayar))}
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
					totalBayar += $n_beli.totalTagihan - $n_beli.totalBayar;
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
				on:click={() => btnSimpanBelanja()}
				class="col-span-2 w-full border bg-orange-500 text-white rounded text-center"
				>Simpan</DropdownItem
			>
		</div>
	</Dropdown>
</div>
{/if}

{#if !$headerContent.suplierOpen }
			<div class="w-full h-8 grid grid-cols-3">
				<div  />
				<button
					on:click={() => (bahanHide = !bahanHide)}
					class="flex justify-right w-full h-8 ml-4 animate-bounce"
				>
					<div class="h-6 w-6 rounded rounded-2xl bg-orange-500 flex justify-center items-center">
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
					<div class="text-center">Tambah</div>
				</button>
				<div  />
			</div>
		{:else}
			<div class="w-full h-8" />
		{/if}

{:else}
<div class="border border-orange-500 shadow rounded-md p-4 max-w-sm w-full mx-auto my-10">
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
	bind:hidden={bahanHide}
	id="sidebar2"
	class="w-full max-w-xl h-1/2 bg-gray-100 p-0"
>
	<div class="grid grid-cols-4 px-2 w-full h-8 my-2">
		{#each $dataKategoriBahan as kategori}
			<button
				class={kategoriNow === kategori ? 'text-white bg-orange-500' : 'text-black bg-white'}
				on:click={() => (kategoriNow = kategori)}>{kategori}</button
			>
		{/each}
	</div>
	<div class="h-3/4 overflow-y-auto w-full">
		<div class="grid grid-cols-4 gap-2">
			{#if $dataBahanStore}
				{#each $dataBahanStore as bahan, index}
					{#if kategoriNow === bahan.kategori}
						<button class="bg-white rounded ronded-sm" on:click={() => pilihBahanClick(bahan)}>
							<div class="flex flex-col items-center p-2">
								<img class="w-full h-1/2" src={bahan.gambar} alt="gambar" />
								<div class="mb-1 text-xs font-medium text-gray-900 dark:text-white">
									{bahan.nama}
								</div>
								<span class="text-xs text-gray-500 dark:text-gray-400">{rupiah(bahan.harga)}r</span>
							</div>
						</button>
					{/if}
				{/each}
			{/if}
		</div>
	</div>
</Drawer>

