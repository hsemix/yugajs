import { directive } from '../compiler/directives.js'
import { evaluate } from '../compiler/evaluator.js'
import { effect } from '../reactive/effect.js'
import { markManagedAttr } from '../runtime/managedAttrs.js'

directive('class', {
    priority: 0,

    mounted(el, { expression }, scope) {
        markManagedAttr(el, 'class')

        effect(() => {
            const value = evaluate(expression, scope)

            if (typeof value === 'string') {
                setClassString(el, value)
                return
            }

            if (Array.isArray(value)) {
                setClassString(el, value.filter(Boolean).join(' '))
                return
            }

            if (value && typeof value === 'object') {
                Object.entries(value).forEach(([classNames, active]) => {
                    classNames
                        .split(/\s+/)
                        .filter(Boolean)
                        .forEach(className => {
                            el.classList.toggle(className, !!active)
                        })
                })
            }
        })
    }
})

function setClassString(el, value) {
    value
        .split(/\s+/)
        .filter(Boolean)
        .forEach(className => {
            el.classList.add(className)
        })
}