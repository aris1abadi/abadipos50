<script>
	// @ts-nocheck

	import { onMount } from 'svelte';
	import {
		dataBahanStore,
		dataSuplier,
		n_beli,
		headerContent,
		displayMode
	} from '$lib/stores/store.js';
	import { io } from '$lib/realtime';

	import { sendToServer, rupiah } from '$lib/myFunction.js';
	import { goto } from '$app/navigation';
	import Pad from '$lib/Pad.svelte';

	import { bikinIdTransaksi, isEmpty, getJam, getTanggal } from '$lib/myFunction.js';

	// @ts-ignore

	import { Dropdown, Avatar, DropdownItem, Input, FloatingLabelInput } from 'flowbite-svelte';
	/**
	 * @type {any[]}
	 */
	let bahanItem = [];

	//let bahanVal = []
	let padShow = [];
	let padMode= []
	let padVal = 0
	let newItemNama = '';
	let newItemHarga = 0;
	let newNama = '';
	let newHarga = 0;

	let suplierOpen = false;

	let transaksiBeliCountNow = 1;
	let totalBayar = 0;

	const nFormat = new Intl.NumberFormat();

	onMount(() => {
		sendToServer('getBahan');
		//sendToServer('getTransaksiBeli');
		sendToServer('getTransaksiBeliCount');
		sendToServer('getSuplier');

		hapusSemua();
		$displayMode = "Belanja"

		//io.on('myTransaksiBeli', (msg) => {
		//	$transaksiBeli = msg;
		//});

		io.on('myBahan', (msg) => {
			//$dataBahanStore = msg;
			$dataBahanStore = [];
			let padSts = false;
			let padMd = false;//false = satuan true = harga
			//console.log("update bahan");
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
					padShow.push(padSts);
					padMode.push(padMd)
				}
			);
			newItemNama = $dataBahanStore[0].nama;
			newItemHarga = $dataBahanStore[0].harga;
			$headerContent.bahanSrc = $dataBahanStore;
			//console.log('update bahan: ', $dataBahanStore);
		});

		io.on('myTransaksiBeliCount', (msg) => {
			$n_beli.id = bikinIdTransaksi('B', msg);
			$headerContent.idTransaksi = $n_beli.id;
			transaksiBeliCountNow = msg;
			//console.log('count: ' + $transaksiJualCount)
		});

		io.on('mySuplier', (msg) => {
			$dataSuplier = msg;
			$n_beli.suplier = $dataSuplier[11];
		});

		//hide padShow
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
		bahanOpen = false;
		bahanItem = bahanItem;
	}

	function tambahClick() {
		if (newNama.length > 0 && newHarga > 0) {
			bahanOpen = false;
			console.log('New Bahan: ', newNama);
			let lastId = $dataBahanStore[$dataBahanStore.length - 1].id;
			let textId = lastId.split('-');
			let numId = parseInt(textId[1]);
			let newId = 'B-' + (numId + 1);
			console.log('newId ', newId);
			let dataBaru = {
				id: newId,
				nama: newNama,
				harga: newHarga,
				satuan: '-',
				suplier: $dataSuplier[0],
				isi: 1,
				stok: 0,
				stokId: '-'
			};
			//simpan bahan
			io.emit('simpanBahan', dataBaru);
			// @ts-ignore
			dataBaru.belanjaCount = 1;
			bahanItem = [...bahanItem, dataBaru];
			bahanItem = bahanItem;
		}
	}

	function suplierClick(suplier) {
		$n_beli.suplier = suplier;
		suplierOpen = false;
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
				isi: 1,
				user: {}
			};
			bahanItem.forEach((bahan, index) => {
				newItem.id = bahan.id;
				newItem.nama = bahan.nama;
				newItem.harga = bahan.harga;
				newItem.jml = bahan.belanjaCount;
				newItem.satuan = bahan.satuan;
				newItem.stokId = bahan.stokId;
				newItem.isi = bahan.isi;
				newItem.user = bahan.user;

				newBahan.push(newItem);
			});

			$n_beli.item = newBahan;

			io.emit('simpanTransaksiBeli', $n_beli);
			console.log('simpan transaksi beli ', $n_beli);

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

<!--
<Header
	on:eventItemClick={belanjaItemClick}
	on:eventHapusOrder={() => hapusBelanja()}
	on:eventHeaderSimpan={() => btnSimpanClick()}
	on:eventNewBahanClick={newBahanClick}
	bind:headerContent={$headerContent}
/>
-->
<div class="w-full h-20 py-4 px-2 mb-8">
	<div class=" border-2 rounded-lg border-orange-500">
		<div
			class="w-full h-8 border-b-2 border-orange-500 bg-orange-500 text-white text-xl font-bold text-center"
		>
			Belanja
		</div>
		<div class="grid grid-cols-2 w-full h-12 mt-2">
			<div class="ml-2 text-xs text-left">Belanja ID :<b> {$n_beli.id}</b></div>
			<div class="ml-2 text-xs text-left">Suplier :<b>
				 {$n_beli.suplier.nama}</b></div>
			<div class="ml-2 text-xs text-left">
				Waktu:<b>{getTanggal($n_beli.waktuBeli)} {getJam($n_beli.waktuBeli)}</b>
			</div>
			<div class="ml-2 text-xs text-left" />
		</div>
	</div>
</div>

<div class="max-h-80 w-full p-4 overflow-y-auto bg-white">
	{#if bahanItem.length}
		{#each bahanItem as bahan, index}
			<div class="grid grid-cols-5 w-full h-15 pr-5 mt-2 border-b-2">
				<div class="col-span-4 pt-2 font-mono font-bold text-sm">{index + 1}.{bahan.nama}</div>
				<div class=" py-2 text-right text-sm font-mono font-bold">
					{rupiah(bahan.belanjaCount * bahan.harga)}
				</div>
				<div />
				<button on:click={() =>{padShow[index] = true ;padMode[index] = false;padVal=0}} class={(padShow[index] && !padMode[index])?"bg-orange-100 text-sm":"bg-white text-sm"} >{bahan.belanjaCount} {bahan.satuan}</button>
				<button on:click={() =>{padShow[index] = true ;padMode[index] = true;padVal=0}} class={(padShow[index] && padMode[index])?"bg-orange-100 text-sm col-span-2":"col-span-2 bg-white text-sm"}>{rupiah(bahan.harga)}</button>
<!--
				<input
					class=" text-left border-none text-xs text-left mr-2"
					type="number"
					bind:value={bahanItem[index].belanjaCount}
					placeholder={bahan.belanjaCount}
					on:change={() => jmlClick(index)}
				/>
				<input
					class="col-span-2 border-none text-xs text-right gbp"
					type="number"
					value={rupiah(bahan.harga)}
					required="required"
					placeholder={rupiah(bahan.harga)}
					on:change={() => hargaClick(index)}
				/>
-->
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
	{:else}
	<div class="animate-bounce w-full h-20 grid grid-cols-11 absolute inset-x-0 bottom-24" >
		<div class="col-span-5"></div>
		<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-full h-full">
			<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 5.25l-7.5 7.5-7.5-7.5m15 6l-7.5 7.5-7.5-7.5" />
		  </svg>
		  
		  
		<div class="col-span-5"></div>
	</div>
	{/if}
</div>
{#if $n_beli.totalTagihan > 0}
	<div class="grid grid-cols-12 w-full h-15 pr-5 my-2">
		<div class="col-span-6" />
		<div class="col-span-3 text-sm font-mono font-bold">Total:</div>
		<div class="col-span-3 pt-1 text-right text-sm font-mono font-bold">
			{rupiah($n_beli.totalTagihan)}
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
				/><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg
			>
			<div class="text-xs font-mono">Batal</div>
		</button>
		<div class="col-span-3 px-4">
			{#if bayarBelanjaOpen === false}
				<button
					on:click={() => btnSimpanBelanja()}
					class="w-full h-full border rounded-lg text-center text-white font-bold bg-orange-500"
					>Simpan</button
				>
			{/if}
		</div>
		<div class="col-span-2 font-semibold border-b-2">Bayar</div>
		<button class="col-span-2 border-b-2 w-full text-right">{rupiah(totalBayar)}</button>
		<Dropdown bind:open={bayarBelanjaOpen}>
			<div class="grid grid-cols-5 gap-2 border-gray-800 bg-gray-100 p-2">
				<DropdownItem class="col-span-5 w-full border-b border-black justify-end">
					<div class="grid grid-cols-5">
						<div class="col-span-3 text-right">Kembalian:</div>
						<div class="col-span-2 text-right font-bold">
							{rupiah(totalBayar - $n_beli.totalTagihan)}
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
						totalBayar += $n_beli.totalTagihan;
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

<!--
	<div class="grid grid-cols-12 w-full h-15 pr-5 my-2 mt-4 border bg-gray-500 text-white">
		<input
			class="col-span-7 pl-4 font-mono text-sm bg-gray-500 text-white"
			bind:value={newItemNama}
			placeholder={newItemNama}
			on:click={() => bahanBaru()}
		/>

		<button class="col-span-1">
			<Chevron />
		</button>
		<Dropdown bind:open={dropdownOpen}>
			{#each $dataBahanStore as bahan, index}
				<DropdownItem on:click={() => dropdownClick(index)}>{bahan.nama}</DropdownItem>
			{/each}
		</Dropdown>
		<input
			class="col-span-2 border-none text-sm bg-gray-500 text-white"
			type="number"
			bind:value={newItemHarga}
			placeholder={String(newItemHarga)}
			on:click={() => (newItemHarga = 0)}
		/>
		<button
			on:click={() => tambahItem()}
			class="col-span-2 pt-2 border-none text-sm font-mono font-bold"
		>
			Tambah
		</button>
	</div>
-->

<Dropdown
	{placement}
	bind:open={suplierOpen}
	triggeredBy="#btnPelanggan"
	class="w-40 h-60 overflow-y-auto"
>
	{#if $dataSuplier}
		{#each $dataSuplier as suplier, index}
			<DropdownItem on:click={() => suplierClick(suplier)} class="border-b-2"
				>{suplier.nama}</DropdownItem
			>
		{/each}
	{/if}
</Dropdown>

<Dropdown
	{placement}
	bind:open={bahanOpen}
	triggeredBy="#btnMenu"
	class="w-72 h-60 overflow-y-auto bg-gray-100"
>
	{#if $dataBahanStore}
		{#each $dataBahanStore as bahan, index}
			<DropdownItem
				on:click={() => pilihBahanClick(bahan)}
				class="flex bahanItem-center text-base font-semibold gap-2"
			>
				<Avatar src="/bahan1.jpeg" size="xs" rounded />{bahan.nama}
			</DropdownItem>
		{/each}
	{/if}
	<div slot="footer" class="grid grid-cols-6 gap-2 p-2 w-80 h-3/4">
		<div class="col-span-3">
		<FloatingLabelInput 
			style="outlined"
			bind:value={newNama}
			name="nama"
			type="text"
			label="Nama"
			size="small"
		/>
		</div>
		<div class="col-span-2">
		<FloatingLabelInput
			style="outlined"
			name="harga"
			type="number"
			label="Harga"
			size="small"
			bind:value={newHarga}
		/>
		</div>
		<button on:click={() => tambahClick()}><Avatar src="plus-circle.svg"></Avatar></button>
	</div>
</Dropdown>

<Dropdown {placement} bind:open={bahanCountOpen} triggeredBy="#btnCount">
	<div class="grid grid-cols-5 gap-2 border-gray-800 bg-gray-100 p-2">
		<DropdownItem class="col-span-5 w-full border-b border-black justify-end">
			<div class="grid grid-cols-5">
				<div class="col-span-3 text-right">Kembalian:</div>
				<div class="col-span-2 text-right font-bold">
					{rupiah(totalBayar - $n_beli.totalTagihan)}
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
				totalBayar += $n_beli.totalTagihan;
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
