const streamContexts = new WeakMap()

export function setStreamContext(el, context) {
    streamContexts.set(el, context)
}

export function getStreamContext(el) {
    const owner = el.closest('[ys-stream]')

    if (!owner) return null

    return streamContexts.get(owner)
}