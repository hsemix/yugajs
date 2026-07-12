import { directive } from '../compiler/directives.js'
import { request } from '../http/request.js'
import { swap } from '../dom/swap.js'
import { emit } from '../runtime/events.js'
import { resolveTarget } from '../dom/targets.js'
import { evaluate } from '../compiler/evaluator.js'
import { debug } from '../runtime/debug.js'

directive('visit', {
    priority: 0,

    mounted(el, { expression }, scope) {
        const handler = async event => {
            if (
                !shouldHandleClick(
                    event,
                    el
                )
            ) {
                return
            }

            event.preventDefault()

            const url =
                expression ||
                el.getAttribute('href') ||
                el.getAttribute('ys-visit')

            if (!url) {
                console.warn(
                    '[YS] ys-visit requires an href or URL'
                )

                return
            }

            const targetExpression =
                el.getAttribute('ys-target') ||
                '#app'

            const swapStrategy =
                el.getAttribute('ys-swap') ||
                'html'

            const cacheTtl = Number(
                el.getAttribute('ys-cache') ||
                0
            )

            const headers =
                resolveElementHeaders(
                    el,
                    scope
                )

            await visit(url, {
                source: el,
                targetExpression,
                swapStrategy,
                fallbackScope: scope,
                cache: cacheTtl,
                headers,

                preserveScroll:
                    el.hasAttribute(
                        'ys-preserve-scroll'
                    )
            })
        }

        el.addEventListener(
            'click',
            handler
        )

        scope?.$cleanup?.(() => {
            el.removeEventListener(
                'click',
                handler
            )
        })
    }
})

export async function visit(
    url,
    {
        source = document.body,

        targetExpression = '#app',
        swapStrategy = 'html',

        fallbackScope = null,

        pushHistory = true,
        replaceHistory = false,

        scroll = true,
        preserveScroll = false,

        headers = {},

        cache = 0,
        cacheKey = null
    } = {}
) {
    const target = resolveTarget(
        source,
        targetExpression
    )

    if (!target) {
        console.warn(
            '[YS] visit target not found:',
            targetExpression
        )

        return false
    }

    const currentScroll = {
        x: window.scrollX,
        y: window.scrollY
    }

    emit('visit:start', {
        url,
        source,
        target,
        targetExpression,
        swapStrategy
    })

    debug('visit:start', {
        url,
        targetExpression,
        swapStrategy
    })

    try {
        const response = await request(
            url,
            {
                method: 'GET',

                headers: {
                    'X-YS-Visit': 'true',
                    Accept:
                        'text/html, application/json',
                    ...headers
                },

                cache,

                /*
                |----------------------------------------------------------
                | Keep visit responses separate from ordinary GET cache.
                |----------------------------------------------------------
                */
                cacheKey:
                    cacheKey ||
                    createVisitCacheKey(
                        url,
                        targetExpression
                    )
            }
        )

        if (handleRedirect(response)) {
            return true
        }

        if (!response?.ok) {
            emit('visit:error', {
                url,
                target,
                response
            })

            debug('visit:error', {
                url,
                response
            })

            return false
        }

        const responseHtml =
            extractResponseHtml(response)

        if (
            typeof responseHtml !== 'string'
        ) {
            console.warn(
                '[YS] visit expected an HTML string but received:',
                responseHtml
            )

            emit('visit:error', {
                url,
                target,
                response,
                reason: 'invalid-html'
            })

            return false
        }

        const parsed =
            parseVisitResponse(
                responseHtml,
                targetExpression
            )

        const targetScope =
            target.__ysScope ||
            fallbackScope ||
            null

        /*
        |--------------------------------------------------------------------------
        | Morph requires a matching root element.
        |--------------------------------------------------------------------------
        */
        const swapHtml =
            swapStrategy === 'morph' &&
            parsed.outerHtml
                ? parsed.outerHtml
                : parsed.innerHtml

        swap(
            target,
            swapHtml,
            swapStrategy,
            targetScope
        )

        if (parsed.title) {
            document.title =
                parsed.title
        }

        updateHistory(
            url,
            {
                targetExpression,
                swapStrategy,
                cache,
                pushHistory,
                replaceHistory,
                scrollX: currentScroll.x,
                scrollY: currentScroll.y
            }
        )

        if (preserveScroll) {
            window.scrollTo(
                currentScroll.x,
                currentScroll.y
            )
        } else if (scroll) {
            window.scrollTo({
                top: 0,
                left: 0,
                behavior: 'auto'
            })
        }

        emit('visit:finish', {
            url,
            source,
            target,
            targetExpression,
            swapStrategy,
            response,
            cached: response.cached
        })

        debug('visit:finish', {
            url,
            targetExpression,
            swapStrategy,
            cached: response.cached
        })

        return true
    } catch (error) {
        emit('visit:error', {
            url,
            target,
            error
        })

        debug('visit:error', {
            url,
            error
        })

        console.error(
            '[YS] visit failed:',
            error
        )

        return false
    }
}

export async function prefetchVisit(
    url,
    {
        targetExpression = '#app',
        headers = {},
        cache = 30
    } = {}
) {
    try {
        await request(url, {
            method: 'GET',

            cache,

            headers: {
                'X-YS-Visit': 'true',
                'X-YS-Prefetch': 'true',
                Accept: 'text/html, application/json',
                ...headers
            },

            // Must match the cacheKey the real visit() call will use for this
            // same link (see the mounted() handler above), or the prefetched
            // response lands in a cache entry the real click never reads from.
            cacheKey: createVisitCacheKey(
                url,
                targetExpression
            )
        })

        debug('visit:prefetch', {
            url
        })

        emit('visit:prefetch', {
            url
        })
    } catch (error) {
        debug('visit:prefetch:error', {
            url,
            error
        })
    }
}

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

function shouldHandleClick(
    event,
    el
) {
    if (event.defaultPrevented) {
        return false
    }

    if (event.button !== 0) {
        return false
    }

    if (
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey
    ) {
        return false
    }

    if (el.hasAttribute('download')) {
        return false
    }

    const target =
        el.getAttribute('target')

    if (
        target &&
        target !== '_self'
    ) {
        return false
    }

    const href =
        el.getAttribute('href')

    if (
        href &&
        (
            href.startsWith('mailto:') ||
            href.startsWith('tel:') ||
            href.startsWith('javascript:')
        )
    ) {
        return false
    }

    return true
}

function extractResponseHtml(response) {
    if (response?.type === 'json') {
        return (
            response.data?.html ??
            null
        )
    }

    if (typeof response === 'string') {
        return response
    }

    return (
        response?.data ??
        response?.html ??
        response?.body ??
        null
    )
}

function parseVisitResponse(
    html,
    targetExpression
) {
    if (!looksLikeDocument(html)) {
        return {
            innerHtml: html,
            outerHtml: null,
            title: null
        }
    }

    const parser =
        new DOMParser()

    const nextDocument =
        parser.parseFromString(
            html,
            'text/html'
        )

    let nextTarget = null

    if (
        isStandardSelector(
            targetExpression
        )
    ) {
        try {
            nextTarget =
                nextDocument.querySelector(
                    targetExpression
                )
        } catch (error) {
            console.warn(
                `[YS] Invalid visit target selector "${targetExpression}"`,
                error
            )
        }
    }

    if (!nextTarget) {
        nextTarget =
            nextDocument.body
    }

    return {
        innerHtml:
            nextTarget.innerHTML,

        outerHtml:
            nextTarget.outerHTML,

        title:
            nextDocument.title ||
            null
    }
}

function looksLikeDocument(html) {
    const value =
        html.trim().toLowerCase()

    return (
        value.startsWith('<!doctype') ||
        value.startsWith('<html') ||
        value.includes('<head') ||
        value.includes('<body')
    )
}

function isStandardSelector(
    expression
) {
    const value = String(
        expression || ''
    ).trim()

    const relativePrefixes = [
        'closest ',
        'find ',
        'find-all ',
        'next ',
        'previous ',
        'children '
    ]

    const relativeKeywords =
        new Set([
            'this',
            'parent',
            'next',
            'previous',
            'children',
            'document',
            'body',
            'head'
        ])

    if (
        relativeKeywords.has(value)
    ) {
        return false
    }

    return !relativePrefixes.some(
        prefix =>
            value.startsWith(prefix)
    )
}

function updateHistory(
    url,
    {
        targetExpression,
        swapStrategy,
        cache,
        pushHistory,
        replaceHistory,
        scrollX,
        scrollY
    }
) {
    if (!pushHistory) {
        return
    }

    const state = {
        ys: true,
        url,
        targetExpression,
        swapStrategy,
        cache,
        scrollX,
        scrollY
    }

    if (replaceHistory) {
        window.history.replaceState(
            state,
            '',
            url
        )

        return
    }

    window.history.pushState(
        state,
        '',
        url
    )
}

function handleRedirect(response) {
    const jsonRedirect =
        response?.type === 'json'
            ? response.data?.redirect
            : null

    const headerRedirect =
        response?.headers?.redirect

    const destination =
        jsonRedirect ||
        headerRedirect

    if (!destination) {
        return false
    }

    const replace =
        response?.type === 'json'
            ? response.data?.replace ??
                false
            : false

    YS.redirect(
        destination,
        replace
    )

    return true
}

function createVisitCacheKey(
    url,
    targetExpression
) {
    return [
        'visit',
        targetExpression,
        url
    ].join(':')
}

window.addEventListener(
    'popstate',
    event => {
        const state = event.state

        if (!state?.ys) {
            return
        }

        visit(
            state.url,
            {
                source: document.body,

                targetExpression:
                    state.targetExpression ||
                    '#app',

                swapStrategy:
                    state.swapStrategy ||
                    'html',

                cache:
                    state.cache || 0,

                pushHistory: false,
                scroll: false
            }
        ).then(success => {
            if (!success) {
                return
            }

            window.scrollTo(
                state.scrollX || 0,
                state.scrollY || 0
            )
        })
    }
)