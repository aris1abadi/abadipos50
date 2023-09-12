<script>
	import { rupiah } from "$lib/myFunction";
	import { io } from "$lib/realtime";
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";

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
		dataSuplier,
		newPelangganGlobal,
		headerContent,
		firstLoad,
		newSuplierGlobal,
	} from "$lib/stores/store";
	import {
		FloatingLabelInput,
		Toggle,
		Label,
		Select,
		Radio,
	} from "flowbite-svelte";

	import { notifications } from "$lib/notifications.js";

	let newMenu = true;
	let newBahan = true;
	let stokUse = false;
	//menu var
	let namaSelect = "";
	let stokIdSelect = "";
	let hargaSelect = 0;
	let hargaGojegSelect = 0;
	let waIdSelect = "-";
	let stokSelect = "";
	let dapurSelect = "1";
	//bahan var
	let bahanSelect = "";
	let satuanBeliSelect = "";
	let satuanPakaiSelect = "";
	let konversiSelect = 1;
	//pelanggan
	let newPelanggan = true;
	let pelangganSelect = "";
	let telpSelect = "";
	let alamatSelect = "";
	let mapSelect = "-";
	//suplier
	let suplierSelect = "";
	let newSuplier = true;

	let gambarSelect = "logo2023.png";
	let kategoriSelect = $dataKategoriMenu[0];
	let editMenu = {
		waId: "-",
		nama: "-",
		harga: 0,
		hargaGojeg: 0,
		stok: 0,
		stokId: "-",
		id: "-",
		kategori: "-",
		gambar: "-",
		dapur: "1",
	};

	let editBahan = {
		id: "-",
		nama: "-",
		harga: 0,
		satuanBeli: "-",
		satuanPakai: "-",
		suplier: {},
		konversi: 1,
		stokId: "-",
		kategori: "-",
		gambar: "logo2023.png",
	};

	let editPelanggan = {
		id: "-",
		nama: "",
		telp: "--",
		alamat: "-",
		map: "0,0",
		gambar: "logo2023.png",
	};

	let editSuplier = {
		id: "-",
		nama: "",
		telp: "--",
		alamat: "-",
		map: "0,0",
		gambar: "logo2023.png",
	};

	onMount(() => {
		if ($firstLoad) {
			goto("/");
			$headerContent.mode = "Home";
		} else {
			$headerContent.mode = "Setup";
		}
		io.on("save_Status",(msg)=>{
			console.log(msg)
		})
	});

	/**
	 * @param {{ nama: string;gambar:string; waId: string;stokId: string;kategori:string;harga:number;hargaGojeg:number }} menu
	 */
	function editMenuClick(menu) {
		// @ts-ignore
		editMenu = menu;
		newMenu = false; //edit menu
		$headerContent.menuSelectOpen = false;
		//$newMenuGlobal = false;
		namaSelect = menu.nama;
		waIdSelect = menu.waId;
		hargaSelect = menu.harga;
		hargaGojegSelect = menu.hargaGojeg;
		kategoriSelect = menu.kategori;
		gambarSelect = menu.gambar;
		dapurSelect = menu.dapur;
		if (menu.stokId === "-") {
			stokUse = false;
		} else {
			stokUse = true;
			stokSelect = menu.stokId;
		}
		//console.log(menu);
	}

	function tampilkanGambar() {
		const fileSelect = document.getElementById("fileInput");
		const file = fileSelect.files[0];
		//console.log('input gambar');

		// Check if a file is selected
		if (file) {
			// Check if the file is an image (optional but recommended)
			if (file.type.match("image.*")) {
				const reader = new FileReader();

				reader.onload = function (event) {
					const previewImage = document.getElementById("imgNow");
					previewImage.src = event.target.result;
				};

				reader.readAsDataURL(file);
			} else {
				console.log("Silahan pilih file gambar");
			}
		} else {
			console.log("Silahkan Pilih file");
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
		const fileInput = document.getElementById("fileInput");
		// @ts-ignore
		const file = fileInput.files[0];
		//console.log(file)
		//io.emit("save_image", file, (status) => {
       ///   console.log(status);
        //});

		if (file) {
			editMenu.gambar = "public/" + file.name;
		} else {
			if (newMenu) {
				//default gambar
				editMenu.gambar = "logo2023.png";
			} else {
				editMenu.gambar = gambarSelect;
			}
		}
		if (stokUse) {
			editMenu.stokId = stokSelect;
		} else {
			editMenu.stokId = "-";
		}

		editMenu.nama = namaSelect;
		editMenu.waId = waIdSelect;
		editMenu.harga = hargaSelect;
		editMenu.hargaGojeg = hargaGojegSelect;
		editMenu.kategori = kategoriSelect;
		editMenu.dapur = dapurSelect;

		const reader = new FileReader();
		reader.onload = function (event) {
			const fileData = {
				name: file.name,
				type: file.type,
				dataMenu: editMenu,
				newMenu: newMenu,
				data0: file,
			};
			fileData.newMenu = newMenu;
			//io.emit('file-upload', fileData);
			io.emit("menu_upload", fileData )
		};

		if (file) {
			reader.readAsDataURL(file);
		}

		let msg = "Menu ";
		msg += editMenu.id;
		msg += " Disimpan";
		notifications.success("Simpan Menu", msg, 2000);
		setTimeout(newMenuClick, 3000);
	}

	function newMenuClick() {
		newMenu = true;
		$headerContent.menuSelectOpen = false;

		stokUse = false;
		namaSelect = "";
		hargaSelect = 0;
		hargaGojegSelect = 0;
		dapurSelect = "1";
		waIdSelect = "";
		stokSelect = "-";
		gambarSelect = "logo2023.png";
		kategoriSelect = $dataKategoriMenu[0];
	}

	//bahan handle
	function newBahanClick() {
		$headerContent.bahanOpen = false;
		newBahan = true;

		bahanSelect = "";
		hargaSelect = 0;
		satuanBeliSelect = $dataSatuan[0];
		satuanPakaiSelect = $dataSatuan[0];
		//editBahan.suplier = {};
		konversiSelect = 1;
		stokIdSelect = "-";
		kategoriSelect = $dataKategoriBahan[0];
		gambarSelect = "logo2023.png";
	}
	function editBahanClick(bahan) {
		$headerContent.bahanOpen = false;
		$newBahanGlobal = false;
		newBahan = false;
		editBahan = bahan;
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
		const fileInput = document.getElementById("fileInput");
		// @ts-ignore
		const file = fileInput.files[0];

		if (file) {
			editBahan.gambar = "public/" + file.name;
		} else {
			//default gambar
			if (newBahan) {
				editBahan.gambar = "logo2023.png";
			} else {
				editBahan.gambar = gambarSelect;
			}
		}

		editBahan.nama = bahanSelect;
		editBahan.harga = hargaSelect;
		editBahan.kategori = kategoriSelect;
		editBahan.stokId = stokIdSelect;
		editBahan.konversi = konversiSelect;
		editBahan.satuanBeli = satuanBeliSelect;
		editBahan.satuanPakai = satuanPakaiSelect;
		editBahan.suplier = suplierSelect;

		const reader = new FileReader();
		reader.onload = function (event) {
			const fileData = {
				name: file.name,
				type: file.type,
				dataBahan: editBahan,
				newBahan: newBahan,
				data0: file,
			};

			io.emit("bahan_upload",fileData )
			//console.log(fileData);
		};
		if (file) {
			reader.readAsDataURL(file);
		}
		let msg = "Bahan ";
		msg += editBahan.id;
		msg += " Disimpan";
		notifications.success("Simpan Bahan", msg, 2000);

		if ($newBahanGlobal) {
			$newBahanGlobal = false;
			goto("/Belanja");
		} else {
			setTimeout(newBahanClick, 3000);
		}
	}
	//------------------------------------
	function newPelangganClick() {
		$headerContent.pelangganOpen = false;
		newPelanggan = true;
		pelangganSelect = "";
		telpSelect = "";
		alamatSelect = "";
		mapSelect = "-";
		gambarSelect = "logo2023.png";
	}

	function editPelangganClick(pelanggan) {
		$headerContent.pelangganOpen = false;
		newPelanggan = false;
		editPelanggan = pelanggan;
		pelangganSelect = pelanggan.nama;
		telpSelect = pelanggan.telp;
		alamatSelect = pelanggan.alamat;
		gambarSelect = pelanggan.gambar;
		mapSelect = pelanggan.map;
	}

	function editSuplierClick(suplier) {
		$headerContent.suplierOpen = false;
		newSuplier = false;
		editSuplier = suplier;
		suplierSelect = suplier.nama;
		telpSelect = suplier.telp;
		alamatSelect = suplier.alamat;
		gambarSelect = suplier.gambar;
		mapSelect = suplier.map;
	}

	function newSuplierClick() {
		newSuplier = true;
		suplierSelect = "";
		telpSelect = "";
		alamatSelect = "";
		mapSelect = "-";
		gambarSelect = "logo2023.png";
	}

	function simpanPelanggan() {
		editPelanggan.nama = pelangganSelect;
		editPelanggan.telp = telpSelect;
		editPelanggan.alamat = alamatSelect;
		editPelanggan.map = mapSelect;

		const fileInput = document.getElementById("fileInput");
		// @ts-ignore
		const file = fileInput.files[0];

		if (file) {
			editBahan.gambar = "public/" + file.name;
		} else {
			//default gambar
			if (newPelanggan) {
				editBahan.gambar = "logo2023.png";
			} else {
				editBahan.gambar = gambarSelect;
			}
		}

		const reader = new FileReader();
		reader.onload = function (event) {
			const fileData = {
				name: file.name,
				type: file.type,
				dataPelanggan: editPelanggan,
				newPelanggan: newPelanggan,
				data0: file,
			};

			io.emit("pelanggan_upload", fileData )
		};

		if (file) {
			reader.readAsDataURL(file);
		}

		let msg = "Pelanggan ";
		msg += editPelanggan.id;
		msg += " Disimpan";
		notifications.success("Simpan Pelanggan", msg, 2000);

		if ($newPelangganGlobal) {
			$newPelangganGlobal = false;
			goto("/Kasir");
		} else {
			setTimeout(newPelangganClick, 3000);
		}
	}

	function simpanSuplier() {
		editSuplier.nama = suplierSelect;
		editSuplier.telp = telpSelect;
		editSuplier.alamat = alamatSelect;
		editSuplier.map = mapSelect;

		const fileInput = document.getElementById("fileInput");
		// @ts-ignore
		const file = fileInput.files[0];

		if (file) {
			editSuplier.gambar = "public/" + file.name;
		} else {
			//default gambar
			if (newSuplier) {
				editSuplier.gambar = "logo2023.png";
			} else {
				editSuplier.gambar = gambarSelect;
			}
		}

		const reader = new FileReader();
		reader.onload = function (event) {
			const fileData = {
				name: file.name,
				type: file.type,
				dataSuplier: editSuplier,
				newSuplier: newSuplier,
				data0: file,
			};

			io.emit("suplier_upload", fileData )
		};
		if (file) {
			reader.readAsDataURL(file);
		}

		let msg = "Suplier ";
		msg += editSuplier.id;
		msg += " Disimpan";
		notifications.success("Simpan Suplier", msg, 2000);

		if ($newSuplierGlobal) {
			$newSuplierGlobal = false;
			goto("/Belanja");
		} else {
			setTimeout(newSuplierClick, 3000);
		}
	}

	$: if ($headerContent.click) {
		$headerContent.click = false;
		if ($headerContent.setupSelect === "menu") {
			if ($headerContent.isNewData) {
				newMenuClick();
			} else {
				// @ts-ignore
				editMenuClick($headerContent.data);
			}
		} else if ($headerContent.setupSelect === "bahan") {
			if ($headerContent.isNewData) {
				newBahanClick();
			} else {
				editBahanClick($headerContent.data);
			}
		} else if ($headerContent.setupSelect === "pelanggan") {
			if ($headerContent.isNewData) {
				newPelangganClick();
			} else {
				editPelangganClick($headerContent.data);
			}
		} else if ($headerContent.setupSelect === "suplier") {
			if ($headerContent.isNewData) {
				newSuplierClick();
			} else {
				editSuplierClick($headerContent.data);
			}
		}
	}
</script>

<div class="w-full h-5/6 mt-4 overflow-y-auto">
	{#if $headerContent.setupSelect === "menu"}
		{#if !$headerContent.menuSelectOpen && !$headerContent.menuOpen}
			<div class="grid grid-cols-2">
				<div class="pt-4 pl-4">
					<div class="w-full h-10 mt-2">
						<div class="text-xs text-left ml-2">Nama Menu</div>
						<input
							class="w-full h-10 text-right rounded rounded-lg"
							type="text"
							bind:value={namaSelect}
						/>
					</div>

					<div class="w-full h-10 my-6">
						<div class="text-xs text-left ml-2">Whatsapp ID</div>
						<input
							class="w-full h-10 text-right rounded rounded-lg"
							type="text"
							bind:value={waIdSelect}
						/>
					</div>

					<div class="grid grid-cols-2 gap-2">
						<div class="w-full h-10">
							<div class="text-xs text-left ml-2">Harga</div>
							<input
								class="w-full h-10 text-right rounded rounded-lg"
								type="number"
								bind:value={hargaSelect}
							/>
						</div>
						<div>
							<div class="text-xs text-left ml-2">Gojeg</div>
							<input
								class="w-full h-10 text-right rounded rounded-lg"
								type="number"
								bind:value={hargaGojegSelect}
							/>
						</div>
					</div>

					<div class="p-2 border rounded mt-4">
						<div>
							<Label class="text-xs font-mono">Pakai Stok</Label>
							<Toggle bind:checked={stokUse} color="orange" />
						</div>
						<div class="mt-2">
							{#if stokUse}
								<Select bind:value={stokSelect}>
									{#each $dataBahanStore as bahan}
										{#if bahan.stokId !== "-"}
											<option value={bahan.stokId}
												>{bahan.nama}</option
											>
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
							<img
								class="h-full w-full"
								id="imgNow"
								src={gambarSelect}
								alt="gambar"
							/>
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

					<div class="px-2 mt-8">
						<Radio
							bind:group={dapurSelect}
							inline
							value="1"
							class="mr-2">Dapur 1</Radio
						>
						<Radio
							bind:group={dapurSelect}
							inline
							value="2"
							class="mr-2">Dapur 2</Radio
						>
						<Radio
							bind:group={dapurSelect}
							inline
							value="3"
							class="mr-2">Daour 3</Radio
						>
					</div>
				</div>
				{#if namaSelect && waIdSelect && hargaSelect > 0}
					<div class="col-span-2 mt-8 flex justify-center">
						<button
							on:click={() => simpanMenu()}
							class="w-1/2 h-10 rounded-lg bg-orange-500 text-white"
							>Simpan Menu</button
						>
					</div>
				{:else}
					<div class="col-span-2 mt-8 flex justify-center">
						<button class="w-1/2 h-10 rounded-lg bg-gray-100"
							>Simpan Menu</button
						>
					</div>
				{/if}
			</div>
		{/if}
	{:else if $headerContent.setupSelect === "bahan"}
		{#if !$headerContent.bahanOpen && !$headerContent.menuOpen && !$headerContent.menuSelectOpen}
			<div class="grid grid-cols-2">
				<div class="pt-4 pl-4">
					<div class="w-full h-10 mt-2">
						<div class="text-xs text-left ml-2">Nama Bahan</div>
						<input
							class="w-full h-10 text-right rounded rounded-lg"
							type="text"
							bind:value={bahanSelect}
						/>
					</div>
					<div class="w-full h-10 mt-6">
						<div class="text-xs text-left ml-2">Harga Beli</div>
						<input
							class="w-full h-10 text-right rounded rounded-lg"
							type="number"
							bind:value={hargaSelect}
						/>
					</div>

					<div class="mt-6">
						<div class="text-xs font-mono">Kategori</div>
						<Select bind:value={kategoriSelect}>
							{#each $dataKategoriBahan as kategori}
								<option value={kategori}>{kategori}</option>
							{/each}
						</Select>
					</div>

					<div class="grid grid-cols-2 gap-2 mt-4">
						<div class="w-full h-10">
							<div class="text-xs text-left ml-2">StokId</div>
							<input
								class="w-full h-10 text-right rounded rounded-lg"
								type="text"
								bind:value={stokIdSelect}
							/>
						</div>

						<div class="w-full h-10">
							<div class="text-xs text-left ml-2">Konversi</div>
							<input
								class="w-full h-10 text-right rounded rounded-lg"
								type="number"
								bind:value={konversiSelect}
							/>
						</div>
					</div>
					<div class="grid grid-cols-2 gap-2 mt-4">
						<div class="mt-4">
							<div class="text-xs font-mono">Sat.Beli</div>
							<Select bind:value={satuanBeliSelect}>
								{#each $dataSatuan as satuan}
									<option value={satuan}>{satuan}</option>
								{/each}
							</Select>
						</div>
						<div class="mt-4">
							<div class="text-xs font-mono">Sat.Pakai</div>
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
							<img
								class="h-full w-full"
								id="imgNow"
								src={gambarSelect}
								alt="gambar"
							/>
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
					<div class="mt-14 px-8">
						<div class="text-xs font-mono">Suplier</div>
						<Select bind:value={suplierSelect}>
							{#each $dataSuplier as suplier}
								<option value={suplier}>{suplier.nama}</option>
							{/each}
						</Select>
					</div>
				</div>

				{#if bahanSelect && hargaSelect > 0}
					<div class="col-span-2 mt-8 flex justify-center">
						<button
							on:click={() => simpanBahan()}
							class="w-1/2 h-10 rounded-lg bg-orange-500 text-white"
							>Simpan Bahan</button
						>
					</div>
				{:else}
					<div class="col-span-2 mt-8 flex justify-center">
						<button class="w-1/2 h-10 rounded-lg bg-gray-100"
							>Simpan Bahan</button
						>
					</div>
				{/if}
			</div>
		{/if}
	{:else if $headerContent.setupSelect === "pelanggan"}
		{#if !$headerContent.pelangganOpen && !$headerContent.menuOpen && !$headerContent.menuSelectOpen}
			<div class="grid grid-cols-2">
				<div class="pt-8 pl-4">
					<div class="w-full h-10 mt-2">
						<div class="text-xs text-left ml-2">Nama Pelanggan</div>
						<input
							class="w-full h-10 text-right rounded rounded-lg"
							type="text"
							bind:value={pelangganSelect}
						/>
					</div>

					<div class="w-full h-10 mt-6">
						<div class="text-xs text-left ml-2">Nomer Hp</div>
						<input
							class="w-full h-10 text-right rounded rounded-lg"
							type="tel"
							bind:value={telpSelect}
						/>
					</div>

					<div class="w-full h-10 mt-6">
						<div class="text-xs text-left ml-2">Alamat</div>
						<input
							class="w-full h-10 text-right rounded rounded-lg"
							type="tel"
							bind:value={alamatSelect}
						/>
					</div>

					<div class="w-full h-10 mt-6">
						<div class="text-xs text-left ml-2">Map</div>
						<input
							class="w-full h-10 text-right rounded rounded-lg"
							type="text"
							bind:value={mapSelect}
						/>
					</div>
				</div>

				<div>
					<div class="w-full h-48 flex justify-center items-center">
						<div class="w-32 h-32 border">
							<img
								class="h-full w-full"
								id="imgNow"
								src={gambarSelect}
								alt="gambar"
							/>
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
				{#if pelangganSelect && telpSelect}
					<div class="col-span-2 mt-8 flex justify-center">
						<button
							on:click={() => simpanPelanggan()}
							class="w-1/2 h-10 rounded-lg bg-orange-500 text-white"
							>Simpan Pelanggan</button
						>
					</div>
				{:else}
					<div class="col-span-2 mt-8 flex justify-center">
						<button class="w-1/2 h-10 rounded-lg bg-gray-100"
							>Simpan Pelanggan</button
						>
					</div>
				{/if}
			</div>
		{/if}
	{:else if $headerContent.setupSelect === "suplier"}
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
					<FloatingLabelInput
						classDiv="my-4"
						color="green"
						style="outlined"
						type="text"
						label="Map"
						size="small"
						bind:value={mapSelect}
					/>
				</div>

				<div>
					<div class="w-full h-48 flex justify-center items-center">
						<div class="w-32 h-32 border">
							<img
								class="h-full w-full"
								id="imgNow"
								src={gambarSelect}
								alt="gambar"
							/>
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
				{#if suplierSelect && telpSelect}
					<div class="col-span-2 mt-8 flex justify-center">
						<button
							on:click={() => simpanSuplier()}
							class="w-1/2 h-10 rounded-lg bg-orange-500 text-white"
							>Simpan Suplier</button
						>
					</div>
				{:else}
					<div class="col-span-2 mt-8 flex justify-center">
						<button class="w-1/2 h-10 rounded-lg bg-gray-100"
							>Simpan Suplier</button
						>
					</div>
				{/if}
			</div>
		{/if}
	{:else if $headerContent.setupSelect === "system"}
		<div />
	{/if}
</div>
