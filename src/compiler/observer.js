import { compile, compileTree } from './compiler.js'

let observer = null

export function observe(root = document.body) {
    if (!root || observer) return

    observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (!(node instanceof Element)) return

                if (node.hasAttribute('ys-data')) {
                    compile(node)
                    return
                }

                const parentComponent = node.closest('[ys-data]')

                if (parentComponent && parentComponent.__ysScope) {
                    compileTree(node, parentComponent.__ysScope)
                }
            })
        })
    })

    observer.observe(root, {
        childList: true,
        subtree: true
    })
}

export function stopObserving() {
    if (!observer) return

    observer.disconnect()
    observer = null
}