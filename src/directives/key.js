import { directive } from '../compiler/directives.js'
import { execute } from '../compiler/evaluator.js'

directive('key', {
    priority: 0,

    handler(el, { arg, modifiers, expression }, scope) {
        const keyCombo = normalizeCombo(arg || expression)

        const target = modifiers.includes('window')
            ? window
            : document

        const handler = event => {
            if (!matchesCombo(event, keyCombo)) return

            execute(expression, scope, {
                $event: event,
                $el: el
            })
        }

        target.addEventListener('keydown', handler)

        if (scope?.$cleanup) {
            scope.$cleanup(() => {
                target.removeEventListener('keydown', handler)
            })
        }
    }
})

function normalizeCombo(combo = '') {
    return combo
        .toLowerCase()
        .replace(/\s+/g, '')
        .split('+')
        .filter(Boolean)
}

function matchesCombo(event, combo) {
    const key = event.key.toLowerCase()

    const required = new Set(combo)

    if (required.has('ctrl') && !event.ctrlKey) return false
    if (required.has('cmd') && !event.metaKey) return false
    if (required.has('meta') && !event.metaKey) return false
    if (required.has('shift') && !event.shiftKey) return false
    if (required.has('alt') && !event.altKey) return false

    const nonModifier = combo.find(k => ![
        'ctrl',
        'cmd',
        'meta',
        'shift',
        'alt'
    ].includes(k))

    if (!nonModifier) return true

    return key === nonModifier
}