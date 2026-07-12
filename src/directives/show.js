import { directive } from '../compiler/directives.js'
import { evaluate } from '../compiler/evaluator.js'
import { effect } from '../reactive/effect.js'
import { registerCleanup } from '../runtime/cleanup.js'
import { transitionShow } from '../dom/transition.js'
import { markManagedAttr } from '../runtime/managedAttrs.js'

directive('show', (el, { expression }, scope) => {
    markManagedAttr(el, 'style')

    let firstRun = true

    const stop = effect(() => {
        const visible = !!evaluate(expression, scope)

        if (firstRun) {
            el.style.display = visible ? '' : 'none'
            firstRun = false
            return
        }

        transitionShow(el, visible)
    });

    registerCleanup(el, stop)
});