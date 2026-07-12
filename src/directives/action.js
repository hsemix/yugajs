import { directive } from '../compiler/directives.js'
import { request } from '../http/request.js'
import { emit } from '../runtime/events.js'

directive('action', (el, { expression }, scope) => {
    const event = el.tagName === 'FORM' ? 'submit' : 'click'

    el.addEventListener(event, async e => {
        e.preventDefault()

        const url = expression
        const action = el.getAttribute('ys-send') || null

        const payload = {
            action,
            state: cleanState(scope)
        }

        emit('action:start', { el, url, payload })

        try {
            const response = await request(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })

            emit('action:success', { el, url, response })

            if (!response.ok) {
                emit('action:error', { el, url, response })
                return
            }

            if (response.type === 'json' && response.data.state) {
                Object.entries(response.data.state).forEach(([key, value]) => {
                    scope[key] = value
                })
            }
        } catch (error) {
            emit('action:error', { el, url, error })
            console.error(error)
        }
    })
})

function cleanState(scope) {
    const state = {}

    Object.keys(scope).forEach(key => {
        if (key.startsWith('$')) return
        if (typeof scope[key] === 'function') return

        state[key] = scope[key]
    })

    return state
}