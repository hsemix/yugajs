import { directive } from '../compiler/directives.js'
import { evaluate } from '../compiler/evaluator.js'
import { effect } from '../reactive/effect.js'
import { registerCleanup } from '../runtime/cleanup.js'
import { markManagedAttr } from '../runtime/managedAttrs.js'

directive('bind', (el, { arg, expression }, scope) => {
    if (!arg) return

    markManagedAttr(el, arg)

    const stop = effect(() => {
        const value = evaluate(expression, scope)

        if (value === false || value === null || value === undefined) {
            el.removeAttribute(arg)
            return
        }

        if (value === true) {
            el.setAttribute(arg, '')
            return
        }

        el.setAttribute(arg, value)
    });

    registerCleanup(el, stop)
})