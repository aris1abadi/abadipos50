<script>
	import { rupiah } from '$lib/myFunction';
	import { io } from '$lib/realtime';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	//import Header from '$lib/Header.svelte';
	import {
		dataMenuStore,
		dataBahanStore,
		dataKategoriMenu,
		dataKategoriBahan,
		dataKategoriUser,
		dataSatuan,
		newBahanGlobal,
		dataPelanggan,
		newPelangganGlobal,
		headerContent,
		firstLoad
	} from '$lib/stores/store';
	import {		
		FloatingLabelInput,
		Toggle,
		Label,
		Select,
		
	} from 'flowbite-svelte';

	
	let newMenu = true;
	let newBahan = true;	
	let stokUse = false;
	//menu var
	let namaSelect = '';
	let stokIdSelect = '';
	let hargaSelect = 0;
	let hargaGojegSelect = 0;
	let waIdSelect = '';
	let stokSelect = '';
	//bahan var
	let bahanSelect = '';
	let satuanBeliSelect = '';
	let satuanPakaiSelect = '';
	let konversiSelect = 1;
	//pelanggan
	let newPelanggan = true;
	let pelangganSelect = '';
	let telpSelect = '';
	let alamatSelect = '';
	//suplier
	let suplierSelect = '';
	let newSuplier = true

	let gambarSelect = 'logo2023.png';
	let kategoriSelect = $dataKategoriMenu[0];
	let editMenu = {
		waId: '-',
		nama: '-',
		harga: 0,
		hargaGojeg: 0,
		stok: 0,
		stokId: '-',
		id: '-',
		kategori: '-',
		gambar: '-'
	};

	let editBahan = {
		nama: '-',
		harga: 0,
		satuanBeli: '-',
		satuanPakai: '-',
		suplier: {},
		konversi: 1,
		stokId: '-',
		kategori: '-',
		gambar: 'logo2023.png'
	};

	let editPelanggan = {
		nama: '',
		telp: '--',
		alamat: '-',
		map: '0,0',
		gambar: 'logo2023.png'
	};

	onMount(() => {
		if ($newBahanGlobal) {
			setupSelect = 'bahan';
			newBahan = true;
			newBahanClick();
		}

		if ($newPelangganGlobal) {
			setupSelect = 'pelanggan';
			newPelanggan = true;
			newPelangganClick();
		}

		if ($firstLoad) {
			goto('/');
			$headerContent.mode = 'Home';
		} else {
			$headerContent.mode = 'Setup';
		}
	});

	/**
	 * @param {{ nama: string;gambar:string; waId: string;stokId: string;kategori:string;harga:number;hargaGojeg:number }} menu
	 */
	function editMenuClick(menu) {
		// @ts-ignore
		editMenu = menu;
		newMenu = false; //edit menu
		$headerContent.menuSelectOpen = false;
		namaSelect = menu.nama;
		waIdSelect = menu.waId;
		hargaSelect = menu.harga;
		hargaGojegSelect = menu.hargaGojeg;
		kategoriSelect = menu.kategori;
		gambarSelect = menu.gambar;
		if (menu.stokId === '-') {
			stokUse = false;
		} else {
			stokUse = true;
			stokSelect = menu.stokId;
		}
		//console.log(menu);
	}

	function tampilkanGambar() {
		const fileSelect = document.getElementById('fileInput');
		const file = fileSelect.files[0];
		//console.log('input gambar');

		// Check if a file is selected
		if (file) {
			// Check if the file is an image (optional but recommended)
			if (file.type.match('image.*')) {
				const reader = new FileReader();

				reader.onload = function (event) {
					const previewImage = document.getElementById('imgNow');
					previewImage.src = event.target.result;
				};

				reader.readAsDataURL(file);
			} else {
				console.log('Please select an image file.');
			}
		} else {
			console.log('Please select a file.');
		}
	}
	/*
	function uploadFile() {
		const fileInput = document.getElementById('fileInput');
		const file = fileInput.files[0];

		const reader = new FileReader();
		reader.onload = function (event) {
			const fileData = {
				name: file.name,
				type: file.type,
				dataMenu: editMenu,
				newMenu: newMenu,
				data0: file
			};
			//io.emit('file-upload', fileData);
			io.emit('file-upload', fileData, (status) => {
				console.log(status);
			});
		};

		reader.readAsDataURL(file);
	}
*/

	function simpanMenu() {
		const fileInput = document.getElementById('fileInput');
		// @ts-ignore
		const file = fileInput.files[0];

		if (file) {
			editMenu.gambar = file.name;
		} else {
			//default gambar
			editMenu.gambar = 'logo2023.png';
		}
		if (stokUse) {
			editMenu.stokId = stokSelect;
		} else {
			editMenu.stokId = '-';
		}

		editMenu.nama = namaSelect;
		editMenu.waId = waIdSelect;
		editMenu.harga = hargaSelect;
		editMenu.hargaGojeg = hargaGojegSelect;
		editMenu.kategori = kategoriSelect;

		const reader = new FileReader();
		reader.onload = function (event) {
			const fileData = {
				name: file.name,
				type: file.type,
				dataMenu: editMenu,
				newMenu: newMenu,
				data0: file
			};
			//io.emit('file-upload', fileData);
			io.emit('menu_upload', fileData, (status) => {
				console.log(status);
			});
		};

		reader.readAsDataURL(file);
		newMenuClick();
	}

	function newMenuClick() {
		newMenu = true;
		$headerContent.menuSelectOpen = false;

		stokUse = false;
		namaSelect = '';
		hargaSelect = 0;
		hargaGojegSelect = 0;
		waIdSelect = '';
		stokSelect = '-';
		gambarSelect = 'logo2023.png';
		kategoriSelect = $dataKategoriMenu[0];
	}

	//bahan handle
	function newBahanClick() {
		$headerContent.bahanOpen = false;
		newBahan = true;

		bahanSelect = '';
		hargaSelect = 0;
		satuanBeliSelect = $dataSatuan[0];
		satuanPakaiSelect = $dataSatuan[0];
		//editBahan.suplier = {};
		konversiSelect = 1;
		stokIdSelect = '-';
		kategoriSelect = $dataKategoriBahan[0];
		gambarSelect = 'logo2023.png';
	}
	function editBahanClick(bahan) {
		$headerContent.bahanOpen = false;
		newBahan = false;

		bahanSelect = bahan.nama;
		hargaSelect = bahan.harga;
		kategoriSelect = bahan.kategori;
		stokIdSelect = bahan.stokId;
		konversiSelect = bahan.konversi;
		satuanBeliSelect = bahan.satuanBeli;
		satuanPakaiSelect = bahan.satuanPakai;
		gambarSelect = bahan.gambar;

		//console.log(bahan)
	}

	function simpanBahan() {
		const fileInput = document.getElementById('fileInput');
		// @ts-ignore
		const file = fileInput.files[0];

		if (file) {
			editBahan.gambar = file.name;
		} else {
			//default gambar
			editBahan.gambar = 'logo2023.png';
		}

		editBahan.nama = bahanSelect;
		editBahan.harga = hargaSelect;
		editBahan.kategori = kategoriSelect;
		editBahan.stokId = stokIdSelect;
		editBahan.konversi = konversiSelect;
		editBahan.satuanBeli = satuanBeliSelect;
		editBahan.satuanPakai = satuanPakaiSelect;

		const reader = new FileReader();
		reader.onload = function (event) {
			const fileData = {
				name: file.name,
				type: file.type,
				dataBahan: editBahan,
				newBahan: newBahan,
				data0: file
			};

			io.emit('bahan_upload', fileData, (status) => {
				console.log(status);
			});
			console.log(fileData);
		};

		reader.readAsDataURL(file);
		newBahanClick();
		if ($newBahanGlobal) {
			$newBahanGlobal = false;
			goto('/Belanja');
		}
	}
	//------------------------------------
	function newPelangganClick() {
		$headerContent.pelangganOpen = false;
		newPelanggan = true;
		pelangganSelect = '';
		telpSelect = '';
		alamatSelect = '';
		gambarSelect = 'logo2023.png';
	}

	function editPelangganClick(pelanggan) {
		$headerContent.pelangganOpen = false;
		newPelanggan = false;

		pelangganSelect = pelanggan.nama;
		telpSelect = pelanggan.telp;
		alamatSelect = pelanggan.alamat;
		gambarSelect = pelanggan.gambar;
	}

	function editSuplierClick(suplier){
		$headerContent.suplierOpen = false;
		newSuplier = false;

		suplierSelect = suplier.nama;
		telpSelect = suplier.telp;
		alamatSelect = suplier.alamat;
		gambarSelect = suplier.gambar;
	}

	function newSuplierClick(){
		suplierSelect = ""
		telpSelect =""
		alamatSelect =""
		gambarSelect = 'logo2023.png';
	}

	function simpanPelanggan() {
		editPelanggan.nama = pelangganSelect;
		editPelanggan.telp = telpSelect;
		editPelanggan.alamat = alamatSelect;

		const fileInput = document.getElementById('fileInput');
		// @ts-ignore
		const file = fileInput.files[0];

		if (file) {
			editBahan.gambar = file.name;
		} else {
			//default gambar
			editBahan.gambar = 'logo2023.png';
		}

		const reader = new FileReader();
		reader.onload = function (event) {
			const fileData = {
				name: file.name,
				type: file.type,
				dataPelanggan: editPelanggan,
				newPelanggan: newPelanggan,
				data0: file
			};

			io.emit('pelanggan_upload', fileData, (status) => {
				console.log(status);
			});
			console.log(fileData);
		};

		reader.readAsDataURL(file);

		if ($newPelangganGlobal) {
			$newPelangganGlobal = false;
			goto('/Kasir');
		}
	}

	function simpanSuplier() {}

	$:if($headerContent.click){
		$headerContent.click = false
		if($headerContent.setupSelect === 'menu'){
			if($headerContent.isNewData){
				newMenuClick();
			}else{
				// @ts-ignore
				editMenuClick($headerContent.data)
			}
		}else if($headerContent.setupSelect === 'bahan'){
			if($headerContent.isNewData){
				newBahanClick();
			}else{
				editBahanClick($headerContent.data)
			}
		}else if($headerContent.setupSelect === 'pelanggan'){
			if($headerContent.isNewData){
				newPelangganClick();
			}else{
				editPelangganClick($headerContent.data)
			}
		}else if($headerContent.setupSelect === 'suplier'){
			if($headerContent.isNewData){
				newSuplierClick();
			}else{
				editSuplierClick($headerContent.data)
			}
		}
	}
</script>

<div class="w-full h-5/6 mt-4 overflow-y-auto">
	{#if $headerContent.setupSelect === 'menu'}
		{#if !$headerContent.menuSelectOpen && !$headerContent.menuOpen}
			<div class="grid grid-cols-2">
				<div class="pt-8 pl-4">
					<FloatingLabelInput
						classDiv="mb-4"
						color="green"
						style="outlined"
						id="nama_menu"
						type="text"
						label="Nama menu"
						size="small"
						bind:value={namaSelect}
					/>
					<FloatingLabelInput
						classDiv="my-4"
						color="green"
						style="outlined"
						id="wa_id"
						type="text"
						label="Whatsapp ID"
						size="small"
						bind:value={waIdSelect}
					/>
					<div class="grid grid-cols-2 gap-2">
						<FloatingLabelInput
							classDiv="my-4"
							color="green"
							style="outlined"
							id="harga"
							type="number"
							label="Harga"
							size="small"
							bind:value={hargaSelect}
						/>
						<FloatingLabelInput
							classDiv="my-4"
							color="green"
							style="outlined"
							id="harga_gojeg"
							type="number"
							label="Gojeg"
							size="small"
							bind:value={hargaGojegSelect}
						/>
					</div>

					<div class="p-2 border rounded">
						<div>
							<Label class="text-xs font-mono">Pakai Stok</Label>
							<Toggle bind:checked={stokUse} color="orange" />
						</div>
						<div class="mt-2">
							{#if stokUse}
								<Select bind:value={stokSelect}>
									{#each $dataBahanStore as bahan}
										{#if bahan.stokId !== '-'}
											<option value={bahan.stokId}>{bahan.nama}</option>
										{/if}
									{/each}
								</Select>
							{/if}
						</div>
					</div>
					<div>
						<div class="mt-4">
							<div class="text-xs font-mono">Kategori</div>
							<Select bind:value={kategoriSelect}>
								{#each $dataKategoriMenu as kategori}
									<option value={kategori}>{kategori}</option>
								{/each}
							</Select>
						</div>
					</div>
				</div>

				<div>
					<div class="w-full h-48 flex justify-center items-center">
						<div class="w-32 h-32 border">
							<img class="h-full w-full" id="imgNow" src={gambarSelect} alt="gambar" />
						</div>
					</div>
					<div class="w-full h-12 flex justify-center items-center">
						<input
							class="flex items-center border border-orange-500 rounded rounded-lg w-3/4 h-8 text-xs"
							type="file"
							id="fileInput"
							on:input={() => tampilkanGambar()}
						/>
					</div>
				</div>
				{#if namaSelect && waIdSelect && hargaSelect > 0}
					<div class="col-span-2 mt-8 flex justify-center">
						<button
							on:click={() => simpanMenu()}
							class="w-1/2 h-10 rounded-lg bg-orange-500 text-white">Simpan Menu</button
						>
					</div>
				{:else}
					<div class="col-span-2 mt-8 flex justify-center">
						<button class="w-1/2 h-10 rounded-lg bg-gray-100">Simpan Menu</button>
					</div>
				{/if}
			</div>
		{/if}
	{:else if $headerContent.setupSelect === 'bahan'}
		{#if !$headerContent.bahanOpen && !$headerContent.menuOpen && !$headerContent.menuSelectOpen}
			<div class="grid grid-cols-2">
				<div class="pt-8 pl-4">
					<FloatingLabelInput
						classDiv="mb-4"
						color="green"
						style="outlined"
						type="text"
						label="Nama Bahan"
						size="small"
						bind:value={bahanSelect}
					/>
					<FloatingLabelInput
						classDiv="my-4"
						color="green"
						style="outlined"
						id="harga"
						type="number"
						label="Harga Beli"
						size="small"
						bind:value={hargaSelect}
					/>

					<div>
						<div class="mt-2">
							<div class="text-xs font-mono">Kategori</div>
							<Select bind:value={kategoriSelect}>
								{#each $dataKategoriBahan as kategori}
									<option value={kategori}>{kategori}</option>
								{/each}
							</Select>
						</div>
					</div>

					<div class="grid grid-cols-2 gap-2">
						<FloatingLabelInput
							classDiv="my-4"
							color="green"
							style="outlined"
							type="text"
							label="Stok ID"
							size="small"
							bind:value={stokIdSelect}
						/>
						<FloatingLabelInput
							classDiv="my-4"
							style="outlined"
							color="green"
							type="number"
							label="Konversi"
							size="small"
							bind:value={konversiSelect}
						/>
					</div>
					<div class="grid grid-cols-2 gap-2">
						<div class="mt-4">
							<div class="text-xs font-mono">Satuan Beli</div>
							<Select bind:value={satuanBeliSelect}>
								{#each $dataSatuan as satuan}
									<option value={satuan}>{satuan}</option>
								{/each}
							</Select>
						</div>
						<div class="mt-4">
							<div class="text-xs font-mono">Satuan Pakai</div>
							<Select bind:value={satuanPakaiSelect}>
								{#each $dataSatuan as satuan}
									<option value={satuan}>{satuan}</option>
								{/each}
							</Select>
						</div>
					</div>
				</div>

				<div>
					<div class="w-full h-48 flex justify-center items-center">
						<div class="w-32 h-32 border">
							<img class="h-full w-full" id="imgNow" src={gambarSelect} alt="gambar" />
						</div>
					</div>
					<div class="w-full h-12 flex justify-center items-center">
						<input
							class="flex items-center border border-orange-500 rounded rounded-lg w-3/4 h-8 text-xs"
							type="file"
							id="fileInput"
							on:input={() => tampilkanGambar()}
						/>
					</div>
				</div>
				{#if bahanSelect && hargaSelect > 0}
					<div class="col-span-2 mt-8 flex justify-center">
						<button
							on:click={() => simpanBahan()}
							class="w-1/2 h-10 rounded-lg bg-orange-500 text-white">Simpan Bahan</button
						>
					</div>
				{:else}
					<div class="col-span-2 mt-8 flex justify-center">
						<button class="w-1/2 h-10 rounded-lg bg-gray-100">Simpan Bahan</button>
					</div>
				{/if}
			</div>
		{/if}
	{:else if $headerContent.setupSelect === 'pelanggan'}
		{#if !$headerContent.pelangganOpen && !$headerContent.menuOpen && !$headerContent.menuSelectOpen}
			<div class="grid grid-cols-2">
				<div class="pt-8 pl-4">
					<FloatingLabelInput
						classDiv="mb-4"
						color="green"
						style="outlined"
						type="text"
						label="Nama Pelanggan"
						size="small"
						bind:value={pelangganSelect}
					/>
					<FloatingLabelInput
						classDiv="my-4"
						color="green"
						style="outlined"
						type="tel"
						label="Nomer Hp"
						size="small"
						bind:value={telpSelect}
					/>

					<FloatingLabelInput
						classDiv="my-4"
						color="green"
						style="outlined"
						type="text"
						label="Alamat"
						size="small"
						bind:value={alamatSelect}
					/>
				</div>

				<div>
					<div class="w-full h-48 flex justify-center items-center">
						<div class="w-32 h-32 border">
							<img class="h-full w-full" id="imgNow" src={gambarSelect} alt="gambar" />
						</div>
					</div>
					<div class="w-full h-12 flex justify-center items-center">
						<input
							class="flex items-center border border-orange-500 rounded rounded-lg w-3/4 h-8 text-xs"
							type="file"
							id="fileInput"
							on:input={() => tampilkanGambar()}
						/>
					</div>
				</div>
				{#if pelangganSelect && telpSelect && alamatSelect}
					<div class="col-span-2 mt-8 flex justify-center">
						<button
							on:click={() => simpanPelanggan()}
							class="w-1/2 h-10 rounded-lg bg-orange-500 text-white">Simpan Pelanggan</button
						>
					</div>
				{:else}
					<div class="col-span-2 mt-8 flex justify-center">
						<button class="w-1/2 h-10 rounded-lg bg-gray-100">Simpan Pelanggan</button>
					</div>
				{/if}
			</div>
		{/if}
	{:else if $headerContent.setupSelect === 'suplier'}
		{#if !$headerContent.suplierOpen && !$headerContent.menuSelectOpen && !$headerContent.menuOpen}
			<div class="grid grid-cols-2">
				<div class="pt-8 pl-4">
					<FloatingLabelInput
						classDiv="mb-4"
						color="green"
						style="outlined"
						type="text"
						label="Nama Suplier"
						size="small"
						bind:value={suplierSelect}
					/>
					<FloatingLabelInput
						classDiv="my-4"
						color="green"
						style="outlined"
						type="tel"
						label="Nomer Hp"
						size="small"
						bind:value={telpSelect}
					/>

					<FloatingLabelInput
						classDiv="my-4"
						color="green"
						style="outlined"
						type="text"
						label="Alamat"
						size="small"
						bind:value={alamatSelect}
					/>
				</div>

				<div>
					<div class="w-full h-48 flex justify-center items-center">
						<div class="w-32 h-32 border">
							<img class="h-full w-full" id="imgNow" src={gambarSelect} alt="gambar" />
						</div>
					</div>
					<div class="w-full h-12 flex justify-center items-center">
						<input
							class="flex items-center border border-orange-500 rounded rounded-lg w-3/4 h-8 text-xs"
							type="file"
							id="fileInput"
							on:input={() => tampilkanGambar()}
						/>
					</div>
				</div>
				{#if pelangganSelect && telpSelect && alamatSelect}
					<div class="col-span-2 mt-8 flex justify-center">
						<button
							on:click={() => simpanSuplier()}
							class="w-1/2 h-10 rounded-lg bg-orange-500 text-white">Simpan Suplier</button
						>
					</div>
				{:else}
					<div class="col-span-2 mt-8 flex justify-center">
						<button class="w-1/2 h-10 rounded-lg bg-gray-100">Simpan Suplier</button>
					</div>
				{/if}
			</div>
		{/if}
	{:else if $headerContent.setupSelect === 'system'}
		<div />
	{/if}
</div>
