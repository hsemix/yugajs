import { YSCollection } from './collection.js'

export function $(selector, context = document) {

    if (typeof selector === 'function') {
        return $.ready(selector)
    }

    // CSS selector
    if (typeof selector === 'string') {
        return new YSCollection([
            ...context.querySelectorAll(selector)
        ])
    }

    // Single element
    if (selector instanceof Element || selector === window || selector === document) {
        return new YSCollection([selector])
    }

    // Array or NodeList
    if (selector instanceof NodeList || Array.isArray(selector)) {
        return new YSCollection([...selector])
    }

    // Ready callback
    if (typeof selector === 'function') {
        document.addEventListener('DOMContentLoaded', selector)

        return new YSCollection([])
    }

    return new YSCollection([])
}