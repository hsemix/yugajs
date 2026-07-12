import { directive } from '../compiler/directives.js'
import { evaluate } from '../compiler/evaluator.js'
import { effect } from '../reactive/effect.js'
import { compileTree } from '../compiler/compiler.js'
import { enter, leave } from '../dom/transition.js'
import {
    isTemplate,
    cloneTemplate,
    insertFragmentBeforeEnd
} from '../dom/template.js'

directive('if', {
    priority: 900,
    structural: true,

    mounted(el, { expression }, scope) {
        const start = document.createComment('ys-if-start')
        const end = document.createComment('ys-if-end')

        const parent = el.parentNode
        const template = el

        parent.insertBefore(start, el)
        parent.insertBefore(end, el.nextSibling)
        el.remove()

        let rendered = []

        effect(() => {
            const visible = !!evaluate(expression, scope)

            if (visible && rendered.length === 0) {
                const clone = cloneIfTemplate(template)

                if (clone instanceof DocumentFragment) {
                    rendered = insertFragmentBeforeEnd(clone, end)

                    rendered.forEach(node => {
                        if (node instanceof Element) {
                            compileTree(node, scope)

                            if (node.hasAttribute('ys-transition')) {
                                enter(node)
                            }
                        }
                    })

                    return
                }

                end.parentNode.insertBefore(clone, end)
                rendered = [clone]

                resetCompiledFlags(clone)

                compileTree(clone, scope)

                if (clone.hasAttribute('ys-transition')) {
                    enter(clone)
                }

                return
            }

            if (!visible && rendered.length > 0) {
                const removing = [...rendered]
                rendered = []

                removing.forEach(node => {
                    if (!(node instanceof Element)) {
                        node.remove()
                        return
                    }

                    if (node.hasAttribute('ys-transition')) {
                        leave(node, () => node.remove())
                    } else {
                        node.remove()
                    }
                })
            }
        })
    }
})

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

function cloneIfTemplate(el) {
    if (el instanceof HTMLTemplateElement) {
        return el.content.cloneNode(true)
    }

    const clone = el.cloneNode(true)
    clone.removeAttribute('ys-if')

    return clone
}