import { effect } from './effect.js'

export function watch(getter, callback) {
    let oldValue
    let initialized = false

    return effect(() => {
        const newValue = getter()

        if (!initialized) {
            oldValue = newValue
            initialized = true
            return
        }

        if (newValue !== oldValue) {
            callback(newValue, oldValue)
            oldValue = newValue
        }
    })
}