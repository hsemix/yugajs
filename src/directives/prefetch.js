import { directive } from '../compiler/directives.js'
import { prefetchVisit } from './visit.js'

directive('prefetch', {
    priority: 0,

    mounted(el, { expression }, scope) {
        let prefetched = false

        const run = () => {
            if (prefetched) return

            const url =
                expression ||
                el.getAttribute('href') ||
                el.getAttribute('ys-prefetch')

            if (!url) return

            prefetched = true

            const targetExpression =
                el.getAttribute('ys-target') ||
                '#app'

            const cacheTtl = Number(
                el.getAttribute('ys-cache') ||
                30
            )

            prefetchVisit(url, {
                targetExpression,
                cache: cacheTtl
            })
        }

        el.addEventListener('mouseenter', run, {
            once: true
        })

        el.addEventListener('focus', run, {
            once: true
        })

        scope?.$cleanup?.(() => {
            el.removeEventListener('mouseenter', run)
            el.removeEventListener('focus', run)
        })
    }
})