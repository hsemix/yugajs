import { directive } from '../compiler/directives.js'
import { markManagedAttr } from '../runtime/managedAttrs.js'

directive('cloak', {
    priority: -1000,

    handler(el) {
        // ys-cloak is meant to be a one-time, first-paint-only attribute -
        // but the server's template always renders it (it has no idea the
        // client already "uncloaked" this element), so a later morph would
        // otherwise add it straight back onto an already-compiled element,
        // where compileElement()'s __ysCompiled guard means cloak's removal
        // handler never runs again - permanently re-hiding it via
        // [ys-cloak]{display:none!important}, no matter what ys-show says.
        markManagedAttr(el, 'ys-cloak')
        el.removeAttribute('ys-cloak')
    }
})