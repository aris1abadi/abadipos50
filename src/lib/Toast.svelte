<script>
    import { flip } from "svelte/animate";
    import { fly } from "svelte/transition";
    import { notifications } from "$lib/notifications.js";

    export let themes = {
        danger: "#E26D69",
        success: "#00cc00",
        warning: "#f0ad4e",
        info: "#5bc0de",
        default: "#aaaaaa",
    };
</script>

<div class="notifications">
    {#each $notifications as notification (notification.id)}
        <div
            animate:flip
            class="toast w-3/4 rounded rounded-lg"
            style="background: {themes[notification.type]};"
            transition:fly={{ y: 30 }}
        >
            <div class="font-bold text-center text-orange-500 text-xl border-b-2">{notification.header}</div>
            <div class="text-left font-mono text-center text-white">{notification.message}</div>
            {#if notification.icon}<i class={notification.icon} />{/if}
        </div>
    {/each}
</div>

<style>
    .notifications {
        position: fixed;
        top: 10px;
        left: 0;
        right: 0;
        margin: 0 auto;
        padding: 0;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        pointer-events: none;
    }

    .toast {
        flex: 0 0 auto;
        margin-bottom: 10px;
    }

    .content {
        padding: 10px;
        display: block;
        color: white;
        font-weight: 500;
    }
</style>
