import { directive } from '../compiler/directives.js'
import { execute } from '../compiler/evaluator.js'
import { registerCleanup } from '../runtime/cleanup.js'

directive('on', (el, { arg, modifiers, expression }, scope) => {
    if (!arg) return

    let handler = event => {
        if (modifiers.includes('prevent')) {
            event.preventDefault()
        }

        if (modifiers.includes('stop')) {
            event.stopPropagation()
        }

        if (modifiers.includes('self') && event.target !== el) {
            return
        }

        execute(expression, scope, {
            $event: event,
            $el: el
        })
    }

    if (modifiers.includes('once')) {
        const original = handler

        handler = event => {
            original(event)
            el.removeEventListener(arg, handler)
        }
    }

    if (modifiers.includes('debounce')) {
        handler = debounce(handler, 300)
    }

    // Fires on a click landing anywhere outside el instead of on it - for
    // click-away-to-close dropdowns/popovers. Has to listen on document
    // (a click "outside" el is, by definition, never dispatched on el
    // itself), so its own listener is cleaned up via registerCleanup
    // rather than relying on el's own garbage collection.
    if (modifiers.includes('outside')) {
        const outsideHandler = event => {
            if (!el.contains(event.target)) {
                handler(event)
            }
        }

        document.addEventListener(arg, outsideHandler)
        registerCleanup(el, () => document.removeEventListener(arg, outsideHandler))
        return
    }

    el.addEventListener(arg, handler)
})

function debounce(callback, delay) {
    let timer = null

    return function (...args) {
        clearTimeout(timer)

        timer = setTimeout(() => {
            callback.apply(this, args)
        }, delay)
    }
}