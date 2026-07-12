import { directive } from '../compiler/directives.js'
import { evaluate } from '../compiler/evaluator.js'

directive('memo', {
    priority: 950,

    mounted(el, { expression }, scope) {
        el.__ysMemo = {
            expression,
            value: evaluate(expression, scope),
            scope
        }
    }
})