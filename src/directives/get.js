import { directive } from '../compiler/directives.js'
import { request } from '../http/request.js'
import { swap } from '../dom/swap.js'
import { debug } from '../runtime/debug.js'
import { bindTrigger } from '../runtime/triggers.js'
import { evaluate } from '../compiler/evaluator.js'
import { resolveTargets } from '../dom/targets.js'
import { emit } from '../runtime/events.js'

directive('get', {
    priority: 0,

    handler(el, { expression }, scope) {
        const url =
            expression ||
            el.getAttribute('ys-get')

        if (!url) {
            console.warn(
                '[YS] ys-get requires a URL'
            )

            return
        }

        async function run(event = null) {
            const targetExpression =
                el.getAttribute('ys-target')

            const swapMode =
                el.getAttribute('ys-swap') ||
                'html'

            const targets = resolveTargets(
                el,
                targetExpression,
                el
            )

            if (!targets.length) {
                console.warn(
                    '[YS] No target found for:',
                    targetExpression
                )

                return
            }

            const finalUrl = buildUrl(
                url,
                el
            )

            const cacheTtl = Number(
                el.getAttribute('ys-cache') || 0
            )

            const headers =
                resolveElementHeaders(
                    el,
                    scope
                )

            emit('request:start', {
                el,
                event,
                method: 'GET',
                url: finalUrl
            })

            debug('request:start', {
                method: 'GET',
                url: finalUrl
            })

            try {
                const result = await request(
                    finalUrl,
                    {
                        method: 'GET',
                        headers,
                        cache: cacheTtl,

                        /*
                        |------------------------------------------------------
                        | Preserve compatibility with the previous cache key.
                        |------------------------------------------------------
                        */
                        cacheKey: finalUrl
                    }
                )

                if (handleRedirect(result)) {
                    return
                }

                if (!result?.ok) {
                    emit('request:error', {
                        el,
                        method: 'GET',
                        url: finalUrl,
                        response: result
                    })

                    debug('request:error', {
                        method: 'GET',
                        url: finalUrl,
                        result
                    })

                    console.error(
                        `[YS] GET failed: ${result?.status}`
                    )

                    return
                }

                emit('request:success', {
                    el,
                    method: 'GET',
                    url: finalUrl,
                    response: result,
                    cached: result.cached
                })

                if (result.type === 'json') {
                    handleJsonResponse(
                        result,
                        targets,
                        swapMode,
                        scope
                    )

                    emit('request:finish', {
                        el,
                        method: 'GET',
                        url: finalUrl,
                        response: result,
                        cached: result.cached
                    })

                    debug('request:finish', {
                        method: 'GET',
                        url: finalUrl,
                        result
                    })

                    return
                }

                const html =
                    extractHtml(result)

                if (typeof html !== 'string') {
                    console.warn(
                        '[YS] GET response did not contain HTML:',
                        html
                    )

                    return
                }

                targets.forEach(target => {
                    swap(
                        target,
                        html,
                        swapMode,
                        scope
                    )
                })

                emit('request:finish', {
                    el,
                    method: 'GET',
                    url: finalUrl,
                    response: result,
                    cached: result.cached
                })

                debug('request:finish', {
                    method: 'GET',
                    url: finalUrl,
                    result
                })
            } catch (error) {
                emit('request:error', {
                    el,
                    method: 'GET',
                    url: finalUrl,
                    error
                })

                debug('request:error', {
                    method: 'GET',
                    url: finalUrl,
                    error
                })

                console.error(error)
            }
        }

        const triggerExpression =
            el.getAttribute('ys-trigger')

        const cleanup = bindTrigger(
            el,
            triggerExpression,
            event => {
                event?.preventDefault?.()
                run(event)
            },
            {
                defaultEvent:
                    el.tagName === 'FORM'
                        ? 'submit'
                        : 'click'
            }
        )

        scope?.$cleanup?.(cleanup)
    }
})

function resolveElementHeaders(
    el,
    scope
) {
    const expression =
        el.getAttribute('ys-headers')

    if (!expression) {
        return {}
    }

    const headers = evaluate(
        expression,
        scope
    )

    if (
        !headers ||
        typeof headers !== 'object' ||
        Array.isArray(headers)
    ) {
        console.warn(
            '[YS] ys-headers must evaluate to an object:',
            headers
        )

        return {}
    }

    return headers
}

function handleRedirect(result) {
    const jsonRedirect =
        result?.type === 'json'
            ? result.data?.redirect
            : null

    const headerRedirect =
        result?.headers?.redirect

    const destination =
        jsonRedirect ||
        headerRedirect

    if (!destination) {
        return false
    }

    const replace =
        result?.type === 'json'
            ? result.data?.replace ?? false
            : false

    YS.redirect(
        destination,
        replace
    )

    return true
}

function handleJsonResponse(
    result,
    targets,
    swapMode,
    scope
) {
    if (
        result.data?.state &&
        scope
    ) {
        Object.entries(
            result.data.state
        ).forEach(([key, value]) => {
            scope[key] = value
        })
    }

    if (
        result.data?.html === undefined
    ) {
        return
    }

    if (
        typeof result.data.html !== 'string'
    ) {
        console.warn(
            '[YS] JSON response "html" must be a string:',
            result.data.html
        )

        return
    }

    targets.forEach(target => {
        swap(
            target,
            result.data.html,
            swapMode,
            scope
        )
    })
}

function extractHtml(result) {
    if (typeof result === 'string') {
        return result
    }

    return (
        result?.html ??
        result?.data ??
        result?.body ??
        ''
    )
}

function buildUrl(url, el) {
    let params =
        new URLSearchParams()

    if (el.tagName === 'FORM') {
        params = new URLSearchParams(
            new FormData(el)
        )
    } else if (el.name) {
        params.set(
            el.name,
            el.value
        )
    }

    if (
        [...params.keys()].length === 0
    ) {
        return url
    }

    const separator =
        url.includes('?')
            ? '&'
            : '?'

    return (
        `${url}${separator}` +
        params.toString()
    )
}