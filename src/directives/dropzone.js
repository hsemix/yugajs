import { directive } from '../compiler/directives.js'

directive('dropzone', {
    priority: 0,

    handler(el, { expression }) {
        const inputSelector = expression || el.getAttribute('ys-dropzone')
        const input = document.querySelector(inputSelector)

        if (!input || input.type !== 'file') {
            console.warn('[YS] ys-dropzone target must be a file input')
            return
        }

        el.addEventListener('click', () => {
            input.click()
        })

        ;['dragenter', 'dragover'].forEach(eventName => {
            el.addEventListener(eventName, event => {
                event.preventDefault()
                el.setAttribute('ys-dragover', '')
            })
        })

        ;['dragleave', 'drop'].forEach(eventName => {
            el.addEventListener(eventName, event => {
                event.preventDefault()
                el.removeAttribute('ys-dragover')
            })
        })

        el.addEventListener('drop', event => {
            const files = event.dataTransfer?.files

            if (!files || files.length === 0) return

            input.files = files

            input.dispatchEvent(new Event('change', { bubbles: true }))
            input.dispatchEvent(new Event('input', { bubbles: true }))
        })
    }
})