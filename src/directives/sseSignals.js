import { directive } from '../compiler/directives.js'

directive('sse-signals', {
    priority: 0,

    handler(el, { expression }) {
        const url = expression || el.getAttribute('ys-sse-signals')

        const source = new EventSource(url)

        source.addEventListener('ys-signal', event => {
            const payload = JSON.parse(event.data)

            const target = document.querySelector(payload.target)

            if (!target || !target.__ysScope) {
                console.warn('[YS] signal target has no scope:', payload.target)
                return
            }

            Object.entries(payload.signals || {}).forEach(([key, value]) => {
                target.__ysScope[key] = value
            })
        })

        source.onmessage = event => {
            const payload = JSON.parse(event.data)

            const target = document.querySelector(payload.target)

            if (!target || !target.__ysScope) return

            Object.entries(payload.signals || {}).forEach(([key, value]) => {
                target.__ysScope[key] = value
            })
        }

        el.__ysSSE = source
    }
})