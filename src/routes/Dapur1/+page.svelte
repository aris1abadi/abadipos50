<script>
    import { onMount } from "svelte";
    import { dataPelanggan, dataMenuStore } from "$lib/stores/store";
    import { sendToServer, getTanggal } from "$lib/myFunction";
    import { io } from "$lib/realtime";
    import { Checkbox } from "flowbite-svelte";

    let hariIni = getTanggal(Date.now());
    /**
     * @type {any[]}
     */
    let antrianDapur = [];

    let dapurNow = "1";

    onMount(() => {
        sendToServer("getTransaksiJualOpen");
        io.on("myTransaksiJualOpen", (msg) => {
            //$dataTransaksiJual = msg;
            console.log(msg);

            //reset antian
            antrianDapur = [];
            //console.log(hariIni)
            hariIni = getTanggal(Date.now());
            if (msg) {
                msg.forEach(
                    (
                        /** @type {{  status: string; waktuOrder: any; }} */ antrian,
                        /** @type {any} */ index
                    ) => {
                        if (antrian.status === "open") {
                            let wto = getTanggal(antrian.waktuOrder);
                            //console.log(wto)
                            if (wto === hariIni) {
                                let itemDapur = {
                                    namaPelanggan: antrian.pelanggan.nama,
                                    jenisOrder: antrian.jenisOrder,
                                    waktuOrder: antrian.waktuOrder,
                                    item: [],
                                };
                                let menuFound = false;

                                antrian.item.itemDetil.forEach((item) => {
                                    $dataMenuStore.forEach((menu) => {
                                        if (item.id === menu.id) {
                                            if (menu.dapur === dapurNow) {
                                                let menuDapur = {
                                                    nama: item.nama,
                                                    id: item.id,
                                                    jml: item.jml,
                                                };

                                                itemDapur.item.push(menuDapur);

                                                menuFound = true;
                                            }
                                        }
                                    });

                                    
                                });
                                if (menuFound) {
                                        antrianDapur.push(itemDapur);
                                    }
                            }
                        }
                    }
                );
            }
            console.log(antrianDapur);
            antrianDapur = antrianDapur;
        });

        if (!$dataPelanggan) {
            sendToServer("getPelanggan");
        }
        

        io.on("myPelanggan", (msg) => {
            $dataPelanggan = msg;
        });
    });
</script>

<div class="w-full h-24 p-4">
    <div
        class="border border-orange-500 bg-orange-200 w-full h-full font-mono font-bold text-center text-2xl flex justify-center items-center"
    >
        Dapur {dapurNow}
    </div>
</div>

<div class="h-full w-full px-5 mt-4 overflow-y-auto">
    {#if antrianDapur.length > 0}
        {#each antrianDapur as antrian, index}
        <div class="bg-gray-100 w-full border border-orange-400 my-2 p-2">
            <div class="w-full h-12 bg-gray-200 grid grid-cols-2 border-b-2 px-4">
                    <div>
                        <div class="text-xs ">pelanggan</div>
                        <div class="font-bold">{antrian.namaPelanggan}</div>
                    </div>
                    <div>
                        <div class="text-xs">Jenis Order</div>
                        <div class="font-bold">{antrian.jenisOrder}</div>
                    </div>
                </div>

                <div class="grid grid-cols-2 pl-1 my-4 ">
                    {#each antrian.item as item_detil}
                        <Checkbox class=" font-mono text-sm text-left  my-2">
                            <div>{item_detil.nama}({item_detil.jml})</div>
                        </Checkbox>
                    {/each}
                </div>
            </div>
        {/each}
    {/if}
</div>
