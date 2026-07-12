import { config } from './config.js'

export function debug(type, payload = {}) {
    if (!config.debug) return

    console.log(`[YS:${type}]`, payload)
}