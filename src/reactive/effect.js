let activeEffect = null
const effectStack = []

export function effect(callback) {
    const runner = () => {
        if (!runner.active) return

        cleanup(runner)

        try {
            effectStack.push(runner)
            activeEffect = runner
            callback()
        } finally {
            effectStack.pop()
            activeEffect = effectStack[effectStack.length - 1] || null
        }
    }

    runner.active = true
    runner.deps = []

    runner.stop = () => {
        if (!runner.active) return

        cleanup(runner)
        runner.active = false
    }

    runner()

    return runner.stop
}

export function getActiveEffect() {
    return activeEffect
}

function cleanup(runner) {
    runner.deps.forEach(dep => {
        dep.delete(runner)
    })

    runner.deps.length = 0
}