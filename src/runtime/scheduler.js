const queue = new Set()
let flushing = false
let currentFlushPromise = null

export function queueJob(job) {
    queue.add(job)

    if (!flushing) {
        flushing = true

        currentFlushPromise = Promise.resolve().then(flushJobs)
    }

    return currentFlushPromise
}

function flushJobs() {
    try {
        queue.forEach(job => job())
    } finally {
        queue.clear()
        flushing = false
        currentFlushPromise = null
    }
}

export function nextTick(callback) {
    const promise = currentFlushPromise || Promise.resolve()

    return callback
        ? promise.then(callback)
        : promise
}