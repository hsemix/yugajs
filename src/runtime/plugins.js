const installedPlugins = new Set()

export function use(YS, plugin, options = {}) {
    if (!plugin) return YS

    const id = plugin.name || plugin

    if (installedPlugins.has(id)) {
        return YS
    }

    if (typeof plugin === 'function') {
        plugin(YS, options)
        installedPlugins.add(id)
        return YS
    }

    if (typeof plugin.install === 'function') {
        plugin.install(YS, options)
        installedPlugins.add(id)
        return YS
    }

    console.warn('[YS] Invalid plugin:', plugin)

    return YS
}

export function installed() {
    return [...installedPlugins]
}