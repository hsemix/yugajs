import { directive } from '../compiler/directives.js'
import { emit } from '../runtime/events.js'
import { registerCleanup } from '../runtime/cleanup.js'
import { handleStreamCommand } from '../stream/commands.js'
import { setStreamContext } from '../stream/context.js'

directive('stream', {
    priority: 10,

    handler(el, { expression }, scope) {
        const url = expression
        const targetSelector = el.getAttribute('ys-target')
        const defaultSwap = el.getAttribute('ys-swap') || 'append'
        const target = targetSelector ? document.querySelector(targetSelector) : el

        if (!url) {
            console.warn('YS: ys-stream requires a URL')
            return
        }

        if (!target) {
            console.warn(`YS: stream target "${targetSelector}" not found`)
            return
        }

        const source = new EventSource(url)

        el.__ysStream = source

        const context = {
            el,
            url,
            scope,
            target,
            defaultSwap,
            source,
            actionUrl: el.getAttribute('ys-action-url') || url
        }
        setStreamContext(el, context)

        emit('stream:start', {
            el,
            url,
            target
        })

        source.onmessage = event => {
            handleStreamCommand('message', event, context)
        }

        const commands = [
            'append',
            'prepend',
            'html',
            'replace',
            'morph',
            'signal',
            'dispatch',
            'redirect',
            'focus',
            'close'
        ]

        commands.forEach(command => {
            source.addEventListener(command, event => {
                handleStreamCommand(command, event, context)
            })
        })

        source.onerror = error => {
            emit('stream:error', {
                el,
                url,
                error,
                readyState: source.readyState
            })

            if (source.readyState === EventSource.CLOSED) {
                console.warn('YS stream closed:', url)
                return
            }

            console.warn('YS stream reconnecting:', url)
        }

        registerCleanup(el, () => {
            source.close()
            emit('stream:close', {
                el,
                url
            })
        })
    }
})