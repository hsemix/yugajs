import { directive } from '../compiler/directives.js'
import { evaluate } from '../compiler/evaluator.js'
import { effect } from '../reactive/effect.js'
import { compileTree } from '../compiler/compiler.js'
import { cloneTemplate, insertFragmentBeforeEnd } from '../dom/template.js'

import { reactive } from '../reactive/reactive.js'

import { enterListNode, leaveListNode, recordPositions, animateMoves } from '../dom/transition.js'

directive('for', {
    priority: 1000,
    structural: true,

    mounted(el, { expression }, scope) {
        const match = expression.match(/^\s*(\w+)(?:\s*,\s*(\w+))?\s+in\s+(.+)\s*$/)

        if (!match) {
            console.warn(`YS: invalid ys-for expression "${expression}"`)
            return
        }

        const [, itemName, indexName, listExpression] = match

        const keyExpression = el.getAttribute('ys-key')

        const start = document.createComment('ys-for-start')
        const end = document.createComment('ys-for-end')
        const parent = el.parentNode
        const template = el

        parent.insertBefore(start, el)
        parent.insertBefore(end, el.nextSibling)
        el.remove()

        let rendered = []
        let keyed = new Map()

        effect(() => {
            const items = Array.from(evaluate(listExpression, scope) || [])

            if (!keyExpression) {
                rendered.forEach(node => node.remove())
                rendered = []

                items.forEach((item, index) => {
                    const childScope = createChildScope(scope, {
                        [itemName]: item,
                        ...(indexName ? { [indexName]: index } : {})
                    })

                    const nodes = createNodes(template, childScope)

                    nodes.forEach(node => {
                        end.parentNode.insertBefore(node, end)
                    })

                    rendered.push(...nodes)
                })

                return
            }

            const oldPositions = template.hasAttribute('ys-transition')
                ? recordPositions(rendered)
                : null

            const nextKeyed = new Map()
            const orderedNodes = []

            items.forEach((item, index) => {
                const childScope = createChildScope(scope, {
                    [itemName]: item,
                    ...(indexName ? { [indexName]: index } : {})
                })

                const key = evaluate(keyExpression, childScope)

                let record = keyed.get(key)

                if (!record) {
                    record = {
                        key,
                        scope: childScope,
                        nodes: createNodes(template, childScope)
                    }
                } else {
                    record.scope[itemName] = item

                    if (indexName) {
                        record.scope[indexName] = index
                    }
                }

                nextKeyed.set(key, record)
                orderedNodes.push(...record.nodes)
            })

            keyed.forEach((record, key) => {
                if (!nextKeyed.has(key)) {
                    record.nodes.forEach(node => {
                        if (template.hasAttribute('ys-transition')) {
                            leaveListNode(node)
                        } else {
                            node.remove()
                        }
                    })
                }
            })

            orderedNodes.forEach(node => {
                end.parentNode.insertBefore(node, end)

                if (
                    template.hasAttribute('ys-transition') &&
                    node instanceof Element &&
                    !node.__ysEntered
                ) {
                    node.__ysEntered = true
                    enterListNode(node)
                }
            })

            if (oldPositions) {
                animateMoves(orderedNodes, oldPositions)
            }

            keyed = nextKeyed
            rendered = orderedNodes
        })
    }
})

function createNodes(template, scope) {
    const clone = cloneTemplate(template)

    if (clone instanceof DocumentFragment) {
        const fragmentEnd = document.createComment('ys-fragment-end')
        const temp = document.createDocumentFragment()

        temp.appendChild(clone)

        const nodes = Array.from(temp.childNodes)

        nodes.forEach(node => {
            if (node instanceof Element) {
                removeStructuralDirectives(node)
                resetCompiledFlags(node)
                compileTree(node, scope)
            }
        })

        return nodes
    }

    removeStructuralDirectives(clone)
    resetCompiledFlags(clone)
    compileTree(clone, scope)

    return [clone]
}

function removeStructuralDirectives(node) {
    if (!(node instanceof Element)) return

    node.removeAttribute('ys-for')
    node.removeAttribute('ys-key')
}

function resetCompiledFlags(node) {
    if (!(node instanceof Element)) return

    delete node.__ysCompiled
    delete node.__ysInitialized
    delete node.__ysCompiledDirectives

    node.querySelectorAll('*').forEach(child => {
        delete child.__ysCompiled
        delete child.__ysInitialized
        delete child.__ysCompiledDirectives
    })
}

function createChildScope(parentScope, locals) {
    const child = reactive(Object.create(parentScope))

    Object.entries(locals).forEach(([key, value]) => {
        Object.defineProperty(child, key, {
            value,
            writable: true,
            enumerable: true,
            configurable: true
        })
    })

    return child
}