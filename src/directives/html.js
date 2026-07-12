import { directive } from '../compiler/directives.js'
import { evaluate } from '../compiler/evaluator.js'
import { effect } from '../reactive/effect.js'
import { registerCleanup } from '../runtime/cleanup.js'

directive('html', (el, { expression }, scope) => {
    const stop = effect(() => {
        el.innerHTML = evaluate(expression, scope) ?? ''
    })

    registerCleanup(el, stop)
})