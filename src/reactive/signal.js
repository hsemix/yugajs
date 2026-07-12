let activeSignalEffect = null

export function signal(initialValue) {
    let value = initialValue
    const subscribers = new Set()

    function notify() {
        subscribers.forEach(callback => callback())
    }

    function track() {
        if (activeSignalEffect) {
            subscribers.add(activeSignalEffect)
        }
    }

    function signalFn(newValue) {
        if (arguments.length === 0) {
            track()
            return value
        }

        if (Object.is(value, newValue)) return value

        value = newValue
        notify()

        return value
    }

    signalFn.peek = () => value

    signalFn.set = newValue => {
        if (Object.is(value, newValue)) return

        value = newValue
        notify()
    }

    Object.defineProperty(signalFn, 'value', {
        get() {
            track()
            return value
        },

        set(newValue) {
            if (Object.is(value, newValue)) return

            value = newValue
            notify()
        }
    })

    return signalFn
}

export function signalEffect(callback) {
    const runner = () => {
        activeSignalEffect = runner

        try {
            callback()
        } finally {
            activeSignalEffect = null
        }
    }

    runner()

    return runner
}