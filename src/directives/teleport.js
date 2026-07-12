import { directive } from '../compiler/directives.js'
import { compileTree } from '../compiler/compiler.js'

directive('teleport', {
    priority: 850,
    structural: true,

    handler(el, { expression }, scope) {
        const target = document.querySelector(expression)

        if (!target) {
            console.warn('[YS] teleport target not found:', expression)
            return
        }

        const placeholder = document.createComment('ys-teleport')
        const parent = el.parentNode

        parent.insertBefore(placeholder, el)

        el.removeAttribute('ys-teleport')
        target.appendChild(el)

        // el (and any directives declared alongside ys-teleport on the same
        // element) was already marked compiled by the outer compileElement()
        // call before this handler ran. Without clearing that flag here,
        // compileTree() below would no-op on el itself and any co-located
        // directive (ys-text, ys-show, etc.) would never mount.
        resetCompiledFlags(el)

        compileTree(el, scope)
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