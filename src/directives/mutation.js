import { request } from '../http/request.js'
import { swap } from '../dom/swap.js'
import { emit } from '../runtime/events.js'
import { startLoading, stopLoading } from '../http/loading.js'
import {
    applyValidationErrors,
    clearValidationErrors
} from '../forms/validation.js'
import { debug } from '../runtime/debug.js'
import { evaluate } from '../compiler/evaluator.js'
import { bindTrigger } from '../runtime/triggers.js'
import { resolveTargets } from '../dom/targets.js'

export function registerMutationDirective(
    directive,
    directiveName,
    method
) {
    directive(directiveName, (el, { expression }, scope) => {
        const handler = async event => {
            event?.preventDefault?.()

            const url =
                expression ||
                el.getAttribute(`ys-${directiveName}`)

            if (!url) {
                console.warn(
                    `[YS] Missing URL for ys-${directiveName}`
                )

                return
            }

            const targetExpression =
                el.getAttribute('ys-target')

            const swapStrategy =
                el.getAttribute('ys-swap') || 'html'

            const targets = resolveTargets(
                el,
                targetExpression,
                el
            )

            if (!targets.length) {
                console.warn(
                    '[YS] No mutation target found for:',
                    targetExpression
                )

                return
            }

            const isForm = el.tagName === 'FORM'

            const {
                body,
                headers: payloadHeaders
            } = buildPayload(
                el,
                scope,
                isForm
            )

            const customHeaders =
                resolveElementHeaders(el, scope)

            const headers = {
                ...payloadHeaders,
                ...customHeaders
            }

            emit('request:start', {
                el,
                url,
                method
            })

            debug('request:start', {
                method,
                url
            })

            startLoading(el)

            try {
                const response = await request(url, {
                    method,
                    body,
                    headers,

                    onProgress(percent) {
                        if (
                            scope &&
                            'progress' in scope
                        ) {
                            scope.progress = percent
                        }

                        emit('request:progress', {
                            el,
                            url,
                            method,
                            percent
                        })
                    }
                })

                debug('request:finish', {
                    method,
                    url,
                    response
                })

                if (handleRedirect(response)) {
                    return
                }

                if (
                    handleValidation(
                        el,
                        url,
                        method,
                        response
                    )
                ) {
                    return
                }

                if (!response?.ok) {
                    emit('request:error', {
                        el,
                        url,
                        method,
                        response
                    })

                    console.error(
                        `[YS] ${method} failed: ${response?.status}`
                    )

                    return
                }

                emit('request:success', {
                    el,
                    url,
                    method,
                    response
                })

                if (response.type === 'json') {
                    handleJsonResponse(
                        response,
                        targets,
                        swapStrategy,
                        scope
                    )

                    emit('request:finish', {
                        el,
                        url,
                        method,
                        response
                    })

                    return
                }

                handleHtmlResponse(
                    response,
                    targets,
                    swapStrategy,
                    scope
                )

                emit('request:finish', {
                    el,
                    url,
                    method,
                    response
                })
            } catch (error) {
                emit('request:error', {
                    el,
                    url,
                    method,
                    error
                })

                debug('request:error', {
                    method,
                    url,
                    error
                })

                console.error(error)
            } finally {
                stopLoading(el)

                if (
                    el.hasAttribute('ys-reset') &&
                    isForm
                ) {
                    el.reset()
                }
            }
        }

        const triggerExpression =
            el.getAttribute('ys-trigger')

        const cleanup = bindTrigger(
            el,
            triggerExpression,
            handler,
            {
                defaultEvent:
                    el.tagName === 'FORM'
                        ? 'submit'
                        : 'click'
            }
        )

        scope?.$cleanup?.(cleanup)
    })
}

function buildPayload(el, scope, isForm) {
    if (el.hasAttribute('ys-no-body')) {
        return {
            body: undefined,
            headers: {}
        }
    }

    if (isForm) {
        return {
            body: new FormData(el),
            headers: {}
        }
    }

    const sendExpression =
        el.getAttribute('ys-send')

    const payload = sendExpression
        ? evaluate(sendExpression, scope)
        : {
            state: cleanState(scope)
        }

    return {
        body: JSON.stringify(payload ?? {}),

        headers: {
            'Content-Type': 'application/json'
        }
    }
}

function resolveElementHeaders(el, scope) {
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

function handleRedirect(response) {
    if (
        response?.type === 'json' &&
        response?.data?.redirect
    ) {
        YS.redirect(
            response.data.redirect,
            response.data.replace ?? false
        )

        return true
    }

    if (response?.headers?.redirect) {
        YS.redirect(
            response.headers.redirect
        )

        return true
    }

    return false
}

function handleValidation(
    el,
    url,
    method,
    response
) {
    if (!el.hasAttribute('ys-validate')) {
        return false
    }

    if (
        response?.type === 'json' &&
        response?.data &&
        response.data.ok === false &&
        response.data.errors
    ) {
        applyValidationErrors(
            el,
            response.data.errors
        )

        emit('request:validation-error', {
            el,
            url,
            method,
            response,
            errors: response.data.errors
        })

        return true
    }

    clearValidationErrors(el)

    return false
}

function handleJsonResponse(
    response,
    targets,
    swapStrategy,
    scope
) {
    if (
        response.data?.state &&
        scope
    ) {
        Object.entries(
            response.data.state
        ).forEach(([key, value]) => {
            scope[key] = value
        })
    }

    if (
        response.data?.html === undefined
    ) {
        return
    }

    if (
        typeof response.data.html !== 'string'
    ) {
        console.warn(
            '[YS] JSON response "html" must be a string:',
            response.data.html
        )

        return
    }

    targets.forEach(target => {
        swap(
            target,
            response.data.html,
            swapStrategy,
            scope
        )
    })
}

function handleHtmlResponse(
    response,
    targets,
    swapStrategy,
    scope
) {
    const html = extractHtml(response)

    if (html === null) {
        return
    }

    if (typeof html !== 'string') {
        console.warn(
            '[YS] Mutation response did not contain HTML:',
            html
        )

        return
    }

    targets.forEach(target => {
        swap(
            target,
            html,
            swapStrategy,
            scope
        )
    })
}

function extractHtml(response) {
    if (typeof response === 'string') {
        return response
    }

    if (response?.data !== undefined) {
        return response.data
    }

    if (response?.html !== undefined) {
        return response.html
    }

    if (response?.body !== undefined) {
        return response.body
    }

    return null
}

function cleanState(scope) {
    const state = {}

    Object.keys(scope || {}).forEach(key => {
        if (key.startsWith('$')) return
        if (typeof scope[key] === 'function') return

        state[key] = scope[key]
    })

    return state
}