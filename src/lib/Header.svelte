<script>
	// @ts-nocheck

	import {
		Dropdown,
		DropdownItem,
		Avatar,
		FloatingLabelInput,
		DropdownDivider,
		Chevron,
		Input,
		ButtonGroup,
		Button,
		Label
	} from 'flowbite-svelte';
	import { sineIn } from 'svelte/easing';
	import { createEventDispatcher, onMount } from 'svelte';
	import { getTanggal, getJam, rupiah } from '$lib/myFunction.js';
	import { goto } from '$app/navigation';
	import {
		dataPelanggan,
		n_order,
		headerContent,
		dataSuplier,
		dataBahanStore,
		dataMenuStore,
		n_beli,
		firstLoad
	} from '$lib/stores/store';

	const dispatch = createEventDispatcher();

	let jenisOrderSrc = ['Bungkus', 'DiWarung', 'Pesan', 'Gojeg', 'Wa Order'];
	let mejaSrc = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
	// @ts-ignore
	/**
	 * @type {string}
	 */

	function dashboardClick() {
		$headerContent.menuOpen = false;
		$headerContent.mode = 'Dashboard';
		goto('/Dashboard');
	}

	function antrianClick() {
		$headerContent.menuOpen = false;
		$headerContent.mode = 'Antrian';
		goto('/Antrian');
	}
	function kasirClick() {
		$headerContent.menuOpen = false;
		$headerContent.mode = 'Kasir';
		goto('/Kasir');
	}
	function belanjaClick() {
		$headerContent.menuOpen = false;
		$headerContent.mode = 'Belanja';
		goto('/Belanja');
	}

	function mejaClick(meja) {
		$headerContent.mejaOpen = false;
		$headerContent.jenisOrderOpen = false;
		$n_order.jenisOrder = 'Meja ' + meja;
	}
	let timeSelect = Date.now();
	function waktuKirimChange() {
		$n_order.waktuKirim = timeSelect;
		$headerContent.jenisOrderOpen = false;
		//$headerContent.waktuOpen = false;
		$n_order.jenisOrder = 'Pesan';
	}

	function setupClick() {
		$headerContent.mode = 'Setup';
		goto('/Setup');
	}

	function editMenuClick(menu) {
		$headerContent.menuSelectOpen = false;
		$headerContent.click = true;
		$headerContent.data = menu;
		$headerContent.isNewData = false;
	}

	function newMenuClick() {
		$headerContent.menuSelectOpen = false;
		$headerContent.click = true;
		$headerContent.isNewData = true;
	}

	function editBahanClick(bahan) {
		$headerContent.bahanOpen = false;
		$headerContent.click = true;
		$headerContent.data = bahan;
		$headerContent.isNewData = false;
	}

	function newBahanClick() {
		$headerContent.bahanOpen = false;
		$headerContent.click = true;
		//$headerContent.data = menu
		$headerContent.isNewData = true;
	}

	function editPelangganClick(pelanggan) {
		$headerContent.pelangganOpen = false;
		$headerContent.click = true;
		$headerContent.data = pelanggan;
		$headerContent.isNewData = false;
	}

	function newPelangganClick() {
		$headerContent.pelangganOpen = false;
		$headerContent.click = true;
		//$headerContent.data = menu
		$headerContent.isNewData = true;
	}

	function editSuplierClick(suplier) {
		$headerContent.suplierOpen = false;
		$headerContent.click = true;
		$headerContent.data = suplier;
		$headerContent.isNewData = false;
	}

	function newSuplierClick() {
		$headerContent.suplierOpen = false;
		$headerContent.click = true;
		//$headerContent.data = menu
		$headerContent.isNewData = true;
	}

	function pelangganBaruClick() {
		$headerContent.mode = 'Setup';
		$headerContent.setupSelect = 'pelanggan';
		$headerContent.click = true;
		//$headerContent.data = menu
		$headerContent.isNewData = true;
		goto('/Setup');
	}
</script>

<div class="w-full h-24 px-2 py-4">
	<div
		class="grid grid-cols-12 flex justify-center w-full h-24 border border-orange-500 rounded-xl rounded-b-none"
	>
		<div class=" h-12 bg-orange-500 rounded-xl rounded-b-none rounded-tr-none">
			<button class="w-full h-full flex justify-center items-center">
				<Avatar src="logo2023.png" class="w-8 h-8 " />
			</button>
			<Dropdown
				padding="none"
				bind:open={$headerContent.menuOpen}
				class="bg-orange-500 text-white "
			>
				<DropdownItem
					on:click={() => {
						goto('/');
						$firstLoad = true;
					}}>Home</DropdownItem
				>
				<DropdownDivider />
				<DropdownItem on:click={() => kasirClick()}>Kasir</DropdownItem>
				<DropdownDivider />
				<DropdownItem on:click={() => belanjaClick()}>Belanja</DropdownItem>
				<DropdownDivider />
				<DropdownItem on:click={() => antrianClick()}>Antrian</DropdownItem>
				<DropdownDivider />
				<DropdownItem on:click={() => dashboardClick()}>Laporan</DropdownItem>
				<DropdownDivider />
				<DropdownItem on:click={() => setupClick()}>Setup</DropdownItem>
			</Dropdown>
		</div>
		<div class="col-span-9 h-12 p-1 text-white bg-orange-500">
			{#if $headerContent.mode === 'Dashboard'}
				<div class="font-bold text-xl ml-4">DashBoard</div>
				<div class="text-xs ml-4 font-bold">{getTanggal(Date.now())}</div>
			{:else if $headerContent.mode === 'Kasir'}
				<div class="text-xl ml-4 font-bold">Penjualan</div>
				<div class="text-xs ml-4 font-bold">{getTanggal(Date.now())} ID: {$n_order.id}</div>
			{:else if $headerContent.mode === 'Belanja'}
				<div class="text-xl ml-4 font-bold">Belanja</div>
				<div class="text-xs ml-4 font-bold">{getTanggal(Date.now())} ID: {$n_beli.id}</div>
			{:else if $headerContent.mode === 'Antrian'}
				<div class="font-bold text-xl ml-4">Antrian</div>
				<div class="text-xs ml-4 font-bold">{getTanggal(Date.now())}</div>
			{:else if $headerContent.mode === 'Setup'}
				<div class="font-bold text-xl ml-4">Setup</div>
			{:else}
				Home
			{/if}
		</div>

		{#if $headerContent.mode === 'Kasir'}
		<button class="bg-orange-500" on:click={() => belanjaClick()}>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="white"
				class="w-6 h-6"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
				/>
			</svg>
		</button>

			
		{:else}
		<button class="bg-orange-500" on:click={() => kasirClick()}>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="white"
				class="w-6 h-6"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
				/>
			</svg>
		</button>
		{/if}

		<button
			class="bg-orange-500 rounded-xl rounded-b-none rounded-tl-none"
			on:click={() => {
				antrianClick();
			}}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="white"
				class="w-6 h-6"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
				/>
			</svg>
		</button>

		<div class="col-span-12 h-12 pb-1">
			{#if $headerContent.mode === 'Dashboard'}
				<div class="font-bold text-xl m-4" />
			{:else if $headerContent.mode === 'Kasir'}
				<div class="grid grid-cols-2 w-full h-11">
					<button class="h-full border-r border-orange-500 p-0">
						<div class="ml-1 text-left font-semibold" style="font-size:10px">Pelanggan</div>
						<div class="font-bold text-xs">{$n_order.pelanggan.nama}</div>
					</button>
					<Dropdown
						padding="none"
						bind:open={$headerContent.pelangganOpen}
						class="bg-orange-500 text-white max-h-64 overflow-y-auto "
					>
						{#each $dataPelanggan as pelanggan}
							<DropdownItem
								on:click={() => {
									$n_order.pelanggan = pelanggan;
									$headerContent.pelangganOpen = false;
								}}>{pelanggan.nama}</DropdownItem
							>
							<DropdownDivider />
						{/each}
						<button on:click={() => pelangganBaruClick()} slot="footer" class="w-full text-center"
							>Pelanggan Baru</button
						>
					</Dropdown>
					<button class="h-full border-l border-orange-500 p-0">
						{#if $n_order.jenisOrder === 'Pesan'}
							<div class="ml-1 text-left font-semibold" style="font-size:10px">Pesanan untuk</div>
							<div class="font-bold text-xs">
								{getTanggal($n_order.waktuKirim)}
								{getJam($n_order.waktuKirim)}
							</div>
						{:else}
							<div class="ml-1 text-left font-semibold" style="font-size:10px">Jenis Order</div>
							<div class="font-bold text-xs">{$n_order.jenisOrder}</div>
						{/if}
					</button>
					<Dropdown
						padding="none"
						bind:open={$headerContent.jenisOrderOpen}
						class="bg-orange-500 text-white"
					>
						{#each jenisOrderSrc as order}
							{#if order === 'DiWarung'}
								<DropdownItem class="flex justify-left">
									<Chevron placement="left">{order}</Chevron>
								</DropdownItem>

								<Dropdown
									placement="left"
									bind:open={$headerContent.mejaOpen}
									class="grid grid-cols-2 w-48 h-96 p-4 overflow-y-auto "
								>
									{#each mejaSrc as meja}
										<DropdownItem on:click={() => mejaClick(meja)}>
											<Avatar size="sm" src="meja.png" rounded />
											<div class="text-xs">Meja {meja}</div>
										</DropdownItem>
									{/each}
								</Dropdown>
								<DropdownDivider />
							{:else if order === 'Pesan'}
								<DropdownItem
									class="flex items-center justify-left hover:bg-orange-500 hover:text-black"
								>
									<div>
										<Label for="Pesan" class="mb-1 text-white">Pesan Untuk</Label>
										<Input
											id="Pesan"
											type="datetime-local"
											bind:value={timeSelect}
											min={Date.now()}
											max="2025-06-14T00:00"
											on:change={() => waktuKirimChange()}
										/>
									</div>
								</DropdownItem>
								<DropdownDivider />
							{:else}
								<DropdownItem
									on:click={() => {
										$n_order.jenisOrder = order;
										$headerContent.jenisOrderOpen = false;
									}}>{order}</DropdownItem
								>
								<DropdownDivider />
							{/if}
						{/each}
					</Dropdown>
				</div>
			{:else if $headerContent.mode === 'Belanja'}
				<div class="grid grid-cols-2 w-full h-11">
					<button class="h-full w-full p-0">
						<div class="ml-1 text-left font-semibold" style="font-size:10px">Suplier</div>
						<div class="font-bold text-xs">{$n_beli.suplier.nama}</div>
					</button>
					<Dropdown
						padding="none"
						bind:open={$headerContent.suplierOpen}
						class="bg-orange-500 text-white max-h-64 overflow-y-auto "
					>
						{#each $dataSuplier as suplier}
							<DropdownItem
								on:click={() => {
									$n_beli.suplier = suplier;
									$headerContent.suplierOpen = false;
								}}>{suplier.nama}</DropdownItem
							>
							<DropdownDivider />
						{/each}
					</Dropdown>
					<div />
				</div>
			{:else if $headerContent.mode === 'Antrian'}
				<div class="w-full h-11 grid grid-cols-3">
					<button
						on:click={() => ($headerContent.antrianSelect = 1)}
						class="w-full border-t border-r border-white {$headerContent.antrianSelect === 1
							? 'bg-white text-black'
							: 'bg-orange-500 text-white'}"
						>Hari Ini
					</button>
					<button
						on:click={() => ($headerContent.antrianSelect = 2)}
						class="w-full border-t border-r border-white {$headerContent.antrianSelect === 2
							? 'bg-white text-black'
							: 'bg-orange-500 text-white'}">Tersimpan</button
					>
					<button
						on:click={() => ($headerContent.antrianSelect = 3)}
						class="w-full border-t border-white {$headerContent.antrianSelect === 3
							? 'bg-white text-black'
							: 'bg-orange-500 text-white'}">Pesan</button
					>
				</div>
			{:else if $headerContent.mode === 'Setup'}
				<div class="w-full h-11 pb-1 grid grid-cols-4">
					<button
						on:click={() => ($headerContent.setupSelect = 'menu')}
						class="w-full border-t border-r border-white {$headerContent.setupSelect === 'menu'
							? 'bg-white text-black'
							: 'bg-orange-500 text-white'}"
						>Menu
					</button>
					<Dropdown
						bind:open={$headerContent.menuSelectOpen}
						class="h-96 ml-4 w-64 overflow-y-auto border border-orange-500"
					>
						{#if $dataMenuStore.length > 0}
							{#each $dataMenuStore as menu, index}
								<DropdownItem on:click={() => editMenuClick(menu)} class="grid grid-cols-3 px-4">
									<Avatar src={menu.gambar} rounded />
									<div class="col-span-2">{menu.nama}</div>
								</DropdownItem>
								<DropdownDivider />
							{/each}
						{/if}
						<DropdownItem on:click={() => newMenuClick()} slot="footer" class="text-orange-500"
							>Tambah Menu</DropdownItem
						>
					</Dropdown>
					<button
						on:click={() => ($headerContent.setupSelect = 'bahan')}
						class="w-full border-t border-r border-white {$headerContent.setupSelect === 'bahan'
							? 'bg-white text-black'
							: 'bg-orange-500 text-white'}">Bahan</button
					>
					<Dropdown bind:open={$headerContent.bahanOpen} class="h-96 ml-4 w-64 overflow-y-auto">
						{#if $dataBahanStore.length > 0}
							{#each $dataBahanStore as bahan, index}
								<DropdownItem on:click={() => editBahanClick(bahan)} class="grid grid-cols-3 px-4">
									<Avatar src={bahan.gambar} rounded />
									<div class="col-span-2">{bahan.nama}</div>
								</DropdownItem>
							{/each}
						{/if}
						<DropdownItem on:click={() => newBahanClick()} slot="footer" class="text-orange-500"
							>Tambah Bahan</DropdownItem
						>
					</Dropdown>
					<button
						on:click={() => ($headerContent.setupSelect = 'pelanggan')}
						class="w-full border-t border-r border-white {$headerContent.setupSelect === 'pelanggan'
							? 'bg-white text-black'
							: 'bg-orange-500 text-white'}">Pelanggan</button
					>
					<Dropdown bind:open={$headerContent.pelangganOpen} class="h-96 ml-4 w-64 overflow-y-auto">
						{#if $dataPelanggan.length > 0}
							{#each $dataPelanggan as pelanggan, index}
								<DropdownItem
									on:click={() => editPelangganClick(pelanggan)}
									class="grid grid-cols-3 px-4"
								>
									<Avatar src={pelanggan.gambar} rounded />
									<div class="col-span-2">{pelanggan.nama}</div>
								</DropdownItem>
							{/each}
						{/if}
						<DropdownItem on:click={() => newPelangganClick()} slot="footer" class="text-orange-500"
							>Tambah Pelanggan</DropdownItem
						>
					</Dropdown>
					<button
						on:click={() => ($headerContent.setupSelect = 'suplier')}
						class="w-full border-t border-r border-white {$headerContent.setupSelect === 'suplier'
							? 'bg-white text-black'
							: 'bg-orange-500 text-white'}">Suplier</button
					>
					<Dropdown bind:open={$headerContent.suplierOpen} class="h-96 ml-4 w-64 overflow-y-auto">
						{#if $dataSuplier.length > 0}
							{#each $dataSuplier as suplier, index}
								<DropdownItem
									on:click={() => editSuplierClick(suplier)}
									class="grid grid-cols-3 px-4"
								>
									<Avatar src={suplier.gambar} rounded />
									<div class="col-span-2">{suplier.nama}</div>
								</DropdownItem>
							{/each}
						{/if}
						<DropdownItem on:click={() => newSuplierClick()} slot="footer" class="text-orange-500"
							>Tambah Suplier</DropdownItem
						>
					</Dropdown>
				</div>
			{:else}
				Home
			{/if}
		</div>
	</div>
</div>
