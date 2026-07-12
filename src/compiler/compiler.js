import { getDirective } from './directives.js'
import { evaluate } from './evaluator.js'
import { reactive } from '../reactive/reactive.js'
import { getComponent } from '../runtime/components.js'
import { watch } from '../reactive/watch.js'
import { getStores } from '../reactive/store.js'
import { debug } from '../runtime/debug.js'

const ignoredDirectives = new Set([
    'target',
    'swap',
    'loading',
    'loading-class',
    'loading-text',
    'component',
    'send',
    'reset',
    'trigger',
    'enter',
    'leave',
    'duration',
    'transition',
    'validate',
    'error-message',
    'cache',
    'props',
    'no-body',
    'headers',

    'preserve-scroll',
    'no-view-transition',
    'prefetch',
    'persist',
])

export function compile(root = document) {
    const start = root instanceof Document ? root.body : root
    if (!start) return

    if (start instanceof Element && (start.hasAttribute('ys-data') || start.hasAttribute('ys-component'))) {
        initComponent(start)
        return
    }

    start.querySelectorAll('[ys-data], [ys-component]').forEach(initComponent)
}

export function compileTree(root, scope) {
    if (!(root instanceof Element)) return

    compileElement(root, scope)

    const elements = root.querySelectorAll('*')

    elements.forEach(el => {
        if (!(el instanceof Element)) return

        if (shouldSkipMemo(el, scope)) {
            return
        }

        // Skip children of ys-for templates.
        const forParent = el.closest('[ys-for], [ys-if]')

        if (forParent && forParent !== el) {
            return
        }

        if (el.hasAttribute('ys-data') || el.hasAttribute('ys-component')) {
            initComponent(el)
            return
        }

        compileElement(el, scope)
    })
}

function hasForParent(el, root) {
    const forParent = el.closest('[ys-for]')

    return forParent && forParent !== el && root.contains(forParent)
}


function initComponent(el) {
    if (el.__ysInitialized) return

    el.__ysInitialized = true

    let data = {}
    let methods = {}
    let init = null
    let props = {}

    const componentName = el.getAttribute('ys-component')

    if (componentName) {
        const definition = getComponent(componentName)

        const propsExpression = el.getAttribute('ys-props')

        if (propsExpression) {
            props = evaluate(propsExpression) || {}
        }

        if (!definition) {
            console.warn(`YS component "${componentName}" is not registered`)
        } else {
            data = typeof definition.data === 'function'
                ? definition.data()
                : definition.data || {}

            methods = definition.methods || {}

            if (typeof definition.init === 'function') {
                init = definition.init
            }
        }
    }

    const expression = el.getAttribute('ys-data')

    if (el.__ysData) {
        data = {
            ...data,
            ...(typeof el.__ysData === 'function'
                ? el.__ysData()
                : el.__ysData)
        }
    }

    if (expression && expression.trim()) {
        data = {
            ...data,
            ...(evaluate(expression) || {})
        }
    }

    // if (expression) {
    //     data = {
    //         ...data,
    //         ...(evaluate(expression) || {})
    //     }
    // }

    data = {
        ...data,
        props
    }

    const scope = createScope(data)

    debug('component:init', {
        el,
        scope
    });

    scope.$el = el
    scope.$store = getStores()

    const slotHTML = el.innerHTML
    scope.$slot = slotHTML

    const cleanups = []

    scope.$cleanup = function (callback) {
        cleanups.push(callback)
    }

    scope.$destroy = function () {
        cleanups.forEach(callback => callback())
        cleanups.length = 0
    }

    Object.entries(methods).forEach(([name, method]) => {
        scope[name] = method.bind(scope)
    })

    scope.$watch = function (getter, callback) {
        const stop = watch(
            () => getter.call(scope),
            (newValue, oldValue) => callback.call(scope, newValue, oldValue)
        )

        scope.$cleanup(stop)

        return stop
    }

    el.__ysScope = scope

    if (init) {
        init.call(scope)
    }

    compileTree(el, scope)
}

function compileElement(el, scope) {
    if (!(el instanceof Element)) return

    if (shouldSkipMemo(el, scope)) {
        return
    }

    if (el.__ysCompiled) return

    const parsedDirectives = Array.from(el.attributes)
        .filter(attr =>
            attr.name.startsWith('ys-') ||
            attr.name.startsWith('@') ||
            attr.name.startsWith(':')
        )
        .filter(attr => attr.name !== 'ys-data')
        .map(attr => parseDirective(attr.name, attr.value))
        .filter(binding => !ignoredDirectives.has(binding.name))
        .map(binding => {
            const definition = getDirective(binding.name)

            if (!definition) {
                console.warn(`YS directive "${binding.name}" is not registered`)
                return null
            }

            return {
                ...binding,
                priority: definition.priority,
                handler: definition.handler,
                structural: definition.structural || false,
                mounted: definition.mounted,
                updated: definition.updated,
                cleanup: definition.cleanup,
            }
        })
        .filter(Boolean)
        .sort((a, b) => b.priority - a.priority)

    if (!parsedDirectives.length) {
        el.__ysCompiled = true
        return
    }

    el.__ysCompiled = true

    for (const binding of parsedDirectives) {
        debug('directive:mounted', {
            name: binding.name,
            el,
            binding
        })
        
        if (binding.mounted) {
            binding.mounted(el, binding, scope)
        }

        if (binding.cleanup && scope?.$cleanup) {
            scope.$cleanup(() => {
                binding.cleanup(el, binding, scope)
            })
        }
        if (binding.structural) {
            break
        }
    }
}

function parseDirective(name, expression) {
    if (name.startsWith('@')) {
        const raw = name.slice(1)
        const [eventPart, ...modifiers] = raw.split('.')

        return {
            name: 'on',
            arg: eventPart,
            modifiers,
            expression
        }
    }

    if (name.startsWith(':')) {
        const raw = name.slice(1)
        const [arg, ...modifiers] = raw.split('.')

        return {
            name: 'bind',
            arg,
            modifiers,
            expression
        }
    }

    const raw = name.slice(3)
    const [directivePart, ...modifierParts] = raw.split('.')
    const [directiveName, arg] = directivePart.split(':')

    return {
        name: directiveName,
        arg,
        modifiers: modifierParts,
        expression
    }
}

function createScope(data) {
    if (typeof data !== 'object' || data === null) {
        return reactive({})
    }

    return reactive(data)
}

function shouldSkipMemo(el, scope) {
    const memo = el.__ysMemo

    if (!memo) return false

    const nextValue = evaluate(memo.expression, scope)

    if (Object.is(nextValue, memo.value)) {
        return true
    }

    memo.value = nextValue

    return false
}