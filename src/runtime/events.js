const listeners = new Map()

export function emit(name, detail = {}) {
    document.dispatchEvent(
        new CustomEvent(`ys:${name}`, {
            detail
        })
    )

    const callbacks = listeners.get(name) || []

    callbacks.forEach(callback => {
        callback(detail)
    })
}

export function on(name, callback) {
    if (!listeners.has(name)) {
        listeners.set(name, new Set())
    }

    listeners.get(name).add(callback)

    return () => {
        listeners.get(name).delete(callback)
    }
}