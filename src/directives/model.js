import { directive } from '../compiler/directives.js'
import { evaluate } from '../compiler/evaluator.js'
import { effect } from '../reactive/effect.js'

directive('model', {
    priority: 0,

    mounted(el, { expression }, scope) {
        effect(() => {
            syncElement(el, evaluate(expression, scope))
        })

        const eventName = getEventName(el)

        el.addEventListener(eventName, () => {
            updateScope(el, expression, scope)
        })
    }
})

function syncElement(el, value) {
    if (el.type === 'file') {
        return
    }

    if (isContentEditable(el)) {
        const next = value ?? ''

        if (el.innerHTML !== String(next)) {
            el.innerHTML = next
        }

        return
    }

    if (el.tagName === 'SELECT' && el.multiple) {
        const values = Array.isArray(value)
            ? value.map(String)
            : []

        Array.from(el.options).forEach(option => {
            option.selected = values.includes(option.value)
        })

        return
    }

    if (el.type === 'checkbox') {
        if (Array.isArray(value)) {
            el.checked = value.map(String).includes(String(el.value))
        } else {
            el.checked = !!value
        }

        return
    }

    if (el.type === 'radio') {
        el.checked = String(value) === String(el.value)
        return
    }

    el.value = value ?? ''
}

function updateScope(el, expression, scope) {
    if (el.type === 'file') {
        scope[expression] = el.multiple
            ? Array.from(el.files || [])
            : (el.files?.[0] ?? null)

        return
    }

    if (isContentEditable(el)) {
        scope[expression] = el.innerHTML
        return
    }

    if (el.tagName === 'SELECT' && el.multiple) {
        scope[expression] = Array.from(el.selectedOptions)
            .map(option => option.value)

        return
    }

    if (el.type === 'checkbox') {
        const current = scope[expression]

        if (Array.isArray(current)) {
            const value = el.value
            const exists = current.map(String).includes(String(value))

            if (el.checked && !exists) {
                scope[expression] = [...current, value]
            }

            if (!el.checked && exists) {
                scope[expression] = current.filter(item => String(item) !== String(value))
            }

            return
        }

        scope[expression] = el.checked
        return
    }

    if (el.type === 'radio') {
        if (el.checked) {
            scope[expression] = el.value
        }

        return
    }

    if (el.type === 'number' || el.type === 'range') {
        scope[expression] = el.value === ''
            ? null
            : el.valueAsNumber

        return
    }

    scope[expression] = el.value
}

function getEventName(el) {
    if (
        el.type === 'checkbox' ||
        el.type === 'radio' ||
        el.type === 'file' ||
        el.tagName === 'SELECT'
    ) {
        return 'change'
    }

    return 'input'
}

function isContentEditable(el) {
    return el.isContentEditable
}