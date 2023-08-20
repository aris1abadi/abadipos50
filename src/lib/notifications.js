import { writable, derived } from "svelte/store"

const TIMEOUT = 3000

function createNotificationStore(timeout) {
    const _notifications = writable([])

    function send(header,message, type = "default", timeout) {
        _notifications.update(state => {
            return [...state, { id: id(), type,header, message, timeout }]
        })
    }

    let timers = []

    const notifications = derived(_notifications, ($_notifications, set) => {
        set($_notifications)
        if ($_notifications.length > 0) {
            const timer = setTimeout(() => {
                _notifications.update(state => {
                    state.shift()
                    return state
                })
            }, $_notifications[0].timeout)
            return () => {
                clearTimeout(timer)
            }
        }
    })
    const { subscribe } = notifications

    return {
        subscribe,
        send,
        default: (hdr,msg, timeout) => send(hdr,msg, "default", timeout),
        danger: (hdr,msg, timeout) => send(hdr,msg, "danger", timeout),
        warning: (hdr,msg, timeout) => send(hdr,msg, "warning", timeout),
        info: (hdr,msg, timeout) => send(hdr,msg, "info", timeout),
        success: (hdr,msg, timeout) => send(hdr,msg, "success", timeout),
    }
}

function id() {
    return '_' + Math.random().toString(36).substr(2, 9);
};

export const notifications = createNotificationStore()