import morphdom from 'morphdom'
import { compile, compileTree } from '../compiler/compiler.js'
import { closestData } from '../compiler/scope.js'

export function morph(target, html, scope = null) {
    if (!target) return

    const template = document.createElement('template')
    template.innerHTML = html.trim()

    const newEl = template.content.firstElementChild

    if (!newEl) return

    morphdom(target, newEl, {
        onBeforeElUpdated(fromEl, toEl) {
            if (
                fromEl instanceof HTMLInputElement ||
                fromEl instanceof HTMLTextAreaElement ||
                fromEl instanceof HTMLSelectElement
            ) {
                // Skip value-preservation when the server explicitly
                // wants to update this input's displayed value - signalled
                // by data-server-value on the incoming toEl (e.g. after a
                // combobox selection clears the in-flight search text and
                // the server wants the resolved label to show instead).
                if (!toEl.hasAttribute('data-server-value')) {
                    toEl.value = fromEl.value
                }
            }

            // Directives like ys-class/ys-show/ys-bind own these attributes
            // reactively and only re-write them when their signal deps
            // change - not on every render. Without this, morphdom syncing
            // toEl's (server-rendered, reactivity-unaware) attribute value
            // onto fromEl would silently undo whatever the directive's
            // effect last set, with nothing left to trigger it again.
            if (fromEl.__ysManagedAttrs) {
                fromEl.__ysManagedAttrs.forEach(name => {
                    if (fromEl.hasAttribute(name)) {
                        toEl.setAttribute(name, fromEl.getAttribute(name))
                    } else {
                        toEl.removeAttribute(name)
                    }
                })
            }

            return true
        },

        onElUpdated(el) {
            compile(el)
        },

        onNodeAdded(node) {
            if (node instanceof Element) {
                // A new node directly inside an existing reactive scope
                // (e.g. a combobox result button added by a search morph)
                // needs compileTree so its own ys-* directives get bound,
                // not just compile() which only initialises ys-data/
                // ys-component roots. compile() handles the top-level
                // "this node IS a new component root" case already; this
                // handles the "this node is a new CHILD inside an existing
                // scope" case.
                const parentScope = closestData(node.parentElement)

                if (parentScope) {
                    compileTree(node, parentScope)
                } else {
                    compile(node)
                }
            }
        }
    })
}