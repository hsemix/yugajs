import { directive } from '../compiler/directives.js'

directive('confirm', {
    priority: 100,

    handler(el, { expression }) {
        el.addEventListener('click', event => {
            const message = expression || 'Are you sure?'

            if (!confirm(message)) {
                event.preventDefault()
                event.stopImmediatePropagation()
            }
        }, true)
    }
})