import { directive } from '../compiler/directives.js'

directive('redirect', {
    mounted(el, { expression }) {
        const event = el.tagName === 'FORM'
            ? 'submit'
            : 'click'

        el.addEventListener(event, e => {
            e.preventDefault()
            window.location.href = expression
        })
    }
})