export function bindTrigger(el, expression, callback, options = {}) {
    const defaultEvent = options.defaultEvent || inferDefaultEvent(el)
    const triggers = parseTriggers(expression || defaultEvent)
    const cleanups = []

    triggers.forEach(trigger => {
        const cleanup = bindSingleTrigger(el, trigger, callback)

        if (typeof cleanup === 'function') {
            cleanups.push(cleanup)
        }
    })

    return () => {
        cleanups.forEach(cleanup => cleanup())
    }
}

function bindSingleTrigger(el, trigger, callback) {
    if (trigger.type === 'load') {
        queueMicrotask(() => callback(createSyntheticEvent('load', el)))
        return null
    }

    if (trigger.type === 'every') {
        const timer = setInterval(
            () => callback(createSyntheticEvent('every', el)),
            trigger.interval
        )

        return () => clearInterval(timer)
    }

    if (trigger.type === 'intersect') {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return

                callback(entry)

                if (trigger.once) {
                    observer.disconnect()
                }
            })
        }, {
            threshold: trigger.threshold ?? 0
        })

        observer.observe(el)

        return () => observer.disconnect()
    }

    const target = trigger.window
        ? window
        : trigger.document
            ? document
            : el

    let handler = event => {
        if (!matchesEvent(event, trigger)) return

        if (trigger.prevent) {
            event.preventDefault()
        }

        if (trigger.stop) {
            event.stopPropagation()
        }

        callback(event)
    }

    if (trigger.debounce !== null) {
        handler = debounce(handler, trigger.debounce)
    }

    if (trigger.throttle !== null) {
        handler = throttle(handler, trigger.throttle)
    }

    target.addEventListener(trigger.event, handler, {
        once: trigger.once,
        capture: trigger.capture,
        passive: trigger.passive
    })

    return () => {
        target.removeEventListener(trigger.event, handler, {
            capture: trigger.capture
        })
    }
}

function parseTriggers(expression) {
    return expression
        .split(',')
        .map(value => value.trim())
        .filter(Boolean)
        .map(parseTrigger)
}

function parseTrigger(expression) {
    const everyMatch = expression.match(/^every\s+(.+)$/)

    if (everyMatch) {
        return {
            type: 'every',
            interval: parseDuration(everyMatch[1])
        }
    }

    const parts = expression.split('.')
    const event = parts.shift()

    if (event === 'load') {
        return {
            type: 'load'
        }
    }

    if (event === 'intersect' || event === 'visible') {
        return {
            type: 'intersect',
            once: parts.includes('once'),
            threshold: readNumberModifier(parts, 'threshold')
        }
    }

    return {
        type: 'event',
        event,
        once: parts.includes('once'),
        prevent: parts.includes('prevent'),
        stop: parts.includes('stop'),
        capture: parts.includes('capture'),
        passive: parts.includes('passive'),
        window: parts.includes('window'),
        document: parts.includes('document'),
        debounce: readDurationModifier(parts, 'debounce'),
        throttle: readDurationModifier(parts, 'throttle'),
        keys: parts.filter(part => KEY_MODIFIERS.has(part))
    }
}

const KEY_MODIFIERS = new Set([
    'enter',
    'escape',
    'space',
    'tab',
    'arrowup',
    'arrowdown',
    'arrowleft',
    'arrowright',
    'ctrl',
    'shift',
    'alt',
    'meta',
    'cmd'
])

function matchesEvent(event, trigger) {
    if (!trigger.keys.length) return true

    for (const key of trigger.keys) {
        if (key === 'ctrl' && !event.ctrlKey) return false
        if (key === 'shift' && !event.shiftKey) return false
        if (key === 'alt' && !event.altKey) return false
        if ((key === 'meta' || key === 'cmd') && !event.metaKey) return false

        if (!['ctrl', 'shift', 'alt', 'meta', 'cmd'].includes(key)) {
            if (normalizeKey(event.key) !== key) return false
        }
    }

    return true
}

function normalizeKey(key = '') {
    const normalized = key.toLowerCase()

    if (normalized === ' ') return 'space'
    if (normalized === 'esc') return 'escape'

    return normalized
}

function readDurationModifier(parts, name) {
    const index = parts.indexOf(name)

    if (index === -1) return null

    const raw = parts[index + 1]

    return raw ? parseDuration(raw) : 300
}

function readNumberModifier(parts, name) {
    const index = parts.indexOf(name)

    if (index === -1) return null

    const value = Number(parts[index + 1])

    return Number.isFinite(value) ? value : null
}

function parseDuration(value) {
    const raw = String(value).trim().toLowerCase()

    if (raw.endsWith('ms')) {
        return Number.parseFloat(raw)
    }

    if (raw.endsWith('s')) {
        return Number.parseFloat(raw) * 1000
    }

    const number = Number.parseFloat(raw)

    return Number.isFinite(number) ? number : 0
}

function inferDefaultEvent(el) {
    if (el.tagName === 'FORM') return 'submit'

    return 'click'
}

function createSyntheticEvent(type, target) {
    return {
        type,
        target,
        currentTarget: target,
        preventDefault() {},
        stopPropagation() {}
    }
}

function debounce(callback, delay) {
    let timer

    return function (...args) {
        clearTimeout(timer)

        timer = setTimeout(() => {
            callback.apply(this, args)
        }, delay)
    }
}

function throttle(callback, delay) {
    let waiting = false
    let pendingArgs = null

    return function (...args) {
        if (!waiting) {
            callback.apply(this, args)
            waiting = true

            setTimeout(() => {
                waiting = false

                if (pendingArgs) {
                    const nextArgs = pendingArgs
                    pendingArgs = null
                    callback.apply(this, nextArgs)
                }
            }, delay)

            return
        }

        pendingArgs = args
    }
}