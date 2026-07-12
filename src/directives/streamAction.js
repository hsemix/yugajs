import { directive } from '../compiler/directives.js'
import { request } from '../http/request.js'
import { emit } from '../runtime/events.js'
import { getStreamContext } from '../stream/context.js'
import { applySignal } from '../stream/applySignal.js'

directive('stream-action', (el, { expression }, scope) => {
    const event = el.tagName === 'FORM' ? 'submit' : 'click'

    el.addEventListener(event, async e => {
        e.preventDefault()

        const context = getStreamContext(el)

        if (!context) {
            console.warn('YS: ys-stream-action must be inside an element with ys-stream')
            return
        }

        const action = expression
        const url = el.getAttribute('ys-action-url') || context.actionUrl

        const payload = {
            action,
            state: cleanState(scope)
        }

        emit('stream:action:start', {
            el,
            url,
            action,
            payload
        })

        try {
            const response = await request(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })

            emit('stream:action:success', {
                el,
                url,
                action,
                response
            })

            if (!response.ok) {
                emit('stream:action:error', {
                    el,
                    url,
                    action,
                    response
                })
                return
            }

            if (response.type === 'json') {
                handleJsonResponse(response.data, scope)
            }
        } catch (error) {
            emit('stream:action:error', {
                el,
                url,
                action,
                error
            })

            console.error(error)
        }
    })
})

function handleJsonResponse(data, scope) {
    if (!data) return

    if (data.state) {
        Object.entries(data.state).forEach(([key, value]) => {
            scope[key] = value
        })
    }

    if (data.signal) {
        applySignal(scope, data.signal)
    }
}

function cleanState(scope) {
    const state = {}

    Object.keys(scope).forEach(key => {
        if (key.startsWith('$')) return
        if (typeof scope[key] === 'function') return

        state[key] = scope[key]
    })

    return state
}