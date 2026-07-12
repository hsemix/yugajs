import { directive } from '../compiler/directives.js'
import { execute } from '../compiler/evaluator.js'
import { handleError } from '../runtime/errors.js'

directive('init', {
    priority: 900,

    handler(el, { expression }, scope) {
        try {
            execute(expression, scope, {
                $el: el
            })
        } catch (error) {
            handleError(error, 'ys-init')
        }
    }
})