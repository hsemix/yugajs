const cache = new Map()

export function getCached(key) {
    const item = cache.get(key)

    if (!item) return null

    if (Date.now() > item.expiresAt) {
        cache.delete(key)
        return null
    }

    return item.value
}

export function setCached(key, value, ttlSeconds = 60) {
    cache.set(key, {
        value,
        expiresAt: Date.now() + ttlSeconds * 1000
    })
}

export function clearCache(key = null) {
    if (key) {
        cache.delete(key)
        return
    }

    cache.clear()
}