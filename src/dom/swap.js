import {
    compile,
    compileTree
} from '../compiler/compiler.js'

import { morph } from './morph.js'

export function swap(
    target,
    html,
    strategy = 'html',
    scope = null
) {
    if (!target) return

    if (html === undefined || html === null) {
        return
    }

    if (typeof html !== 'string') {
        console.warn(
            '[YS] swap expected an HTML string but received:',
            html
        )

        return
    }

    const targetScope =
        target.__ysScope ||
        scope ||
        null

    if (strategy === 'html') {
        target.innerHTML = html

        compileInsertedContent(target, targetScope)

        return
    }

    if (strategy === 'morph') {
        morph(target, html)

        resetMorphedChildren(target)

        if (targetScope) {
            compileTree(target, targetScope)
        } else {
            compile(target)
        }

        return
    }

    if (strategy === 'replace' || strategy === 'outer') {
        const trimmed = html.trim()

        if (!trimmed) {
            target.remove()
            return
        }

        const template = document.createElement('template')
        template.innerHTML = trimmed

        const newEl = template.content.firstElementChild

        if (!newEl) return

        target.replaceWith(newEl)

        if (
            newEl.hasAttribute('ys-data') ||
            newEl.hasAttribute('ys-component')
        ) {
            compile(newEl)
        } else if (targetScope) {
            compileTree(newEl, targetScope)
        }

        return
    }

    if (strategy === 'append') {
        const inserted = insertHtml(
            target,
            html,
            'beforeend'
        )

        compileInsertedNodes(inserted, targetScope)

        return
    }

    if (strategy === 'prepend') {
        const inserted = insertHtml(
            target,
            html,
            'afterbegin'
        )

        compileInsertedNodes(inserted, targetScope)

        return
    }

    target.innerHTML = html
    compileInsertedContent(target, targetScope)
}

function compileInsertedContent(target, scope) {
    if (
        target.hasAttribute('ys-data') ||
        target.hasAttribute('ys-component')
    ) {
        compile(target)
        return
    }

    if (scope) {
        compileTree(target, scope)
        return
    }

    compile(target)
}

function insertHtml(target, html, position) {
    const template = document.createElement('template')
    template.innerHTML = html

    const nodes = Array.from(template.content.childNodes)

    target.insertAdjacentHTML(position, html)

    if (position === 'beforeend') {
        return Array.from(target.childNodes)
            .slice(-nodes.length)
    }

    return Array.from(target.childNodes)
        .slice(0, nodes.length)
}

function compileInsertedNodes(nodes, scope) {
    nodes.forEach(node => {
        if (!(node instanceof Element)) return

        if (
            node.hasAttribute('ys-data') ||
            node.hasAttribute('ys-component')
        ) {
            compile(node)
        } else if (scope) {
            compileTree(node, scope)
        }
    })
}

function resetMorphedChildren(root) {
    if (!(root instanceof Element)) return

    delete root.__ysCompiled
    delete root.__ysCompiledDirectives

    root.querySelectorAll('*').forEach(el => {
        delete el.__ysCompiled
        delete el.__ysInitialized
        delete el.__ysCompiledDirectives
    })
}