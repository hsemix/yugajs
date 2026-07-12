export function resolveTarget(el, expression, fallback = null) {
    return resolveTargets(el, expression, fallback)[0] || null
}

export function resolveTargets(el, expression, fallback = null) {
    const value = String(expression || '').trim()

    if (!value) {
        return normalizeFallback(fallback)
    }

    const relative = resolveRelativeTarget(el, value)

    if (relative !== null) {
        return uniqueElements(relative)
    }

    try {
        return uniqueElements(
            Array.from(document.querySelectorAll(value))
        )
    } catch (error) {
        console.warn(
            `[YS] Invalid target expression "${value}"`,
            error
        )

        return normalizeFallback(fallback)
    }
}

function resolveRelativeTarget(el, expression) {
    if (expression === 'this') {
        return [el]
    }

    if (expression === 'parent') {
        return el.parentElement
            ? [el.parentElement]
            : []
    }

    if (expression === 'body') {
        return document.body
            ? [document.body]
            : []
    }

    if (expression === 'head') {
        return document.head
            ? [document.head]
            : []
    }

    if (
        expression === 'document' ||
        expression === 'html'
    ) {
        return document.documentElement
            ? [document.documentElement]
            : []
    }

    if (expression === 'next') {
        return el.nextElementSibling
            ? [el.nextElementSibling]
            : []
    }

    if (expression.startsWith('next ')) {
        const selector = expression.slice(5).trim()

        return findSibling(
            el.nextElementSibling,
            selector,
            'nextElementSibling'
        )
    }

    if (expression === 'previous') {
        return el.previousElementSibling
            ? [el.previousElementSibling]
            : []
    }

    if (expression.startsWith('previous ')) {
        const selector = expression.slice(9).trim()

        return findSibling(
            el.previousElementSibling,
            selector,
            'previousElementSibling'
        )
    }

    if (expression.startsWith('closest ')) {
        const selector = expression.slice(8).trim()

        try {
            const match = el.closest(selector)

            return match ? [match] : []
        } catch (error) {
            warnInvalidRelativeTarget(expression, error)
            return []
        }
    }

    if (expression.startsWith('find-all ')) {
        const selector = expression.slice(9).trim()

        try {
            return findAllFromNearestContainer(
                el,
                selector
            )
        } catch (error) {
            warnInvalidRelativeTarget(expression, error)
            return []
        }
    }

    if (expression.startsWith('find ')) {
        const selector = expression.slice(5).trim()

        try {
            const match = findFromNearestContainer(
                el,
                selector
            )

            return match ? [match] : []
        } catch (error) {
            warnInvalidRelativeTarget(expression, error)
            return []
        }
    }

    if (expression === 'children') {
        return Array.from(el.children)
    }

    if (expression.startsWith('children ')) {
        const selector = expression.slice(9).trim()

        try {
            return Array.from(el.children)
                .filter(child => child.matches(selector))
        } catch (error) {
            warnInvalidRelativeTarget(expression, error)
            return []
        }
    }

    return null
}

function findFromNearestContainer(el, selector) {
    let container = el.parentElement

    while (container) {
        const match = container.querySelector(selector)

        if (match) {
            return match
        }

        container = container.parentElement
    }

    return null
}

function findAllFromNearestContainer(el, selector) {
    let container = el.parentElement

    while (container) {
        const matches = Array.from(
            container.querySelectorAll(selector)
        )

        if (matches.length) {
            return matches
        }

        container = container.parentElement
    }

    return []
}

function findSibling(start, selector, direction) {
    if (!selector) {
        return start ? [start] : []
    }

    let current = start

    try {
        while (current) {
            if (current.matches(selector)) {
                return [current]
            }

            current = current[direction]
        }
    } catch (error) {
        warnInvalidRelativeTarget(selector, error)
    }

    return []
}

function normalizeFallback(fallback) {
    if (!fallback) {
        return []
    }

    if (fallback instanceof Element) {
        return [fallback]
    }

    if (
        fallback instanceof NodeList ||
        fallback instanceof HTMLCollection ||
        Array.isArray(fallback)
    ) {
        return uniqueElements(
            Array.from(fallback)
        )
    }

    if (typeof fallback === 'string') {
        try {
            return uniqueElements(
                Array.from(
                    document.querySelectorAll(fallback)
                )
            )
        } catch {
            return []
        }
    }

    return []
}

function uniqueElements(elements) {
    return [
        ...new Set(
            elements.filter(
                element => element instanceof Element
            )
        )
    ]
}

function warnInvalidRelativeTarget(expression, error) {
    console.warn(
        `[YS] Invalid relative target "${expression}"`,
        error
    )
}