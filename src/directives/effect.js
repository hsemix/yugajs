import { directive } from '../compiler/directives.js'
import { execute } from '../compiler/evaluator.js'
import { effect } from '../reactive/effect.js'
import { registerCleanup } from '../runtime/cleanup.js'

directive('effect', (el, { expression }, scope) => {
    const stop = effect(() => {
        execute(expression, scope, {
            $el: el
        })
    })
    registerCleanup(el, stop)
})