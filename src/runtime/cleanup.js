const cleanupMap = new WeakMap()

export function registerCleanup(el, callback) {
    if (!cleanupMap.has(el)) {
        cleanupMap.set(el, [])
    }

    cleanupMap.get(el).push(callback)
}

export function cleanupElement(el) {
    const callbacks = cleanupMap.get(el) || []

    callbacks.forEach(callback => {
        try {
            callback()
        } catch (error) {
            console.error('YS cleanup error:', error)
        }
    })

    cleanupMap.delete(el)

    if (el.querySelectorAll) {
        el.querySelectorAll('*').forEach(child => {
            cleanupElement(child)
        })
    }

    if (el.__ysScope?.$destroy) {
        el.__ysScope.$destroy()
    }
}