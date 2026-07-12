import { directive } from '../compiler/directives.js'
import { compileTree } from '../compiler/compiler.js'

directive('slot', {
    priority: 0,

    mounted(el, binding, scope) {
        el.innerHTML = scope.$slot || ''

        // scope.$slot is captured from this component root's own original
        // innerHTML, so it can itself contain this very ys-slot placeholder
        // (this is the common case, since there's currently no separate
        // template that would keep the two apart). Rendering it back
        // verbatim would recreate a live ys-slot placeholder inside itself,
        // which would then do the same thing again - forever. Strip the
        // attribute from the injected copy so it renders as inert markup
        // instead of re-triggering this directive.
        el.querySelectorAll('[ys-slot]').forEach(node => node.removeAttribute('ys-slot'))

        compileTree(el, scope)
    }
})