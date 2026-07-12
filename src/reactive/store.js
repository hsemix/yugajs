import { reactive } from './reactive.js'
import { watch } from './watch.js'

const stores = reactive({})

export function store(name, value, options = {}) {

    if (!name) {
        return stores
    }

    if (value === undefined) {
        return stores[name]
    }

    const persist = options.persist || false
    const storageKey = options.key || `ys-store:${name}`

    let initialValue = value

    if (persist) {
        const saved = localStorage.getItem(storageKey)

        if (saved) {
            try {
                initialValue = {
                    ...value,
                    ...JSON.parse(saved)
                }
            } catch (error) {
                console.warn(
                    `[YS] Failed to parse persisted store "${name}"`
                )
            }
        }
    }

    const reactiveStore = reactive(initialValue)

    if (persist) {
        watch(
            () => JSON.stringify(reactiveStore),
            serialized => {
                localStorage.setItem(storageKey, serialized)
            }
        )
    }

    stores[name] = reactiveStore

    return reactiveStore
}

export function getStores() {
    return stores
}

export function clearStore(name) {
    if (!name) {
        Object.keys(stores).forEach(key => {
            delete stores[key]
            localStorage.removeItem(`ys-store:${key}`)
        })

        return
    }

    delete stores[name]
    localStorage.removeItem(`ys-store:${name}`)
}