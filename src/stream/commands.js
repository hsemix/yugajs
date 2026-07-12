import { swap } from '../dom/swap.js'
import { emit } from '../runtime/events.js'
import { applySignal } from './applySignal.js'

export function handleStreamCommand(command, event, context) {
    const {
        el,
        url,
        scope,
        target,
        defaultSwap
    } = context

    const data = event.data

    emit('stream:message', {
        el,
        url,
        command,
        data
    })

    if (command === 'message') {
        swap(target, data, defaultSwap, scope)
        return
    }

    if (['append', 'prepend', 'html', 'replace', 'morph'].includes(command)) {
        swap(target, data, command, scope)
        return
    }

    if (command === 'signal') {
        try {
            const payload = JSON.parse(data)

            applySignal(scope, payload)

            emit('stream:signal', {
                el,
                url,
                payload
            })
        } catch (error) {
            console.error('YS stream signal error:', error)
        }

        return
    }

    if (command === 'dispatch') {
        try {
            const payload = JSON.parse(data)

            window.dispatchEvent(
                new CustomEvent(payload.event, {
                    detail: payload.detail || {}
                })
            )

            emit('stream:dispatch', {
                el,
                url,
                payload
            })
        } catch (error) {
            console.error('YS stream dispatch error:', error)
        }

        return
    }

    if (command === 'redirect') {
        window.location.href = data
        return
    }

    if (command === 'focus') {
        const field = document.querySelector(data)

        if (field) {
            field.focus()
        }

        return
    }

    if (command === 'close') {
        context.source?.close()

        emit('stream:close', {
            el,
            url
        })

        return
    }

    console.warn(`YS: unknown stream command "${command}"`)
}