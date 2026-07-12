import { directive } from '../compiler/directives.js'
import { evaluate } from '../compiler/evaluator.js'
import { effect } from '../reactive/effect.js'
import { registerCleanup } from '../runtime/cleanup.js'

directive('text', (el, { expression }, scope) => {
    const stop = effect(() => {
        el.textContent = evaluate(expression, scope) ?? ''
    })

    registerCleanup(el, stop)
})