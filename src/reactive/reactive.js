import { getActiveEffect } from './effect.js'
import { queueJob } from '../runtime/scheduler.js'

const targetMap = new WeakMap()

export function reactive(target) {
    return new Proxy(target, {
        has(obj, key) {
            return key in obj
        },

        get(obj, key) {
            track(obj, key)
            return obj[key]
        },

        set(obj, key, value) {
            obj[key] = value
            trigger(obj, key)
            return true
        }
    })
}

function track(target, key) {
    const activeEffect = getActiveEffect()

    if (!activeEffect) return

    let depsMap = targetMap.get(target)

    if (!depsMap) {
        depsMap = new Map()
        targetMap.set(target, depsMap)
    }

    let deps = depsMap.get(key)

    if (!deps) {
        deps = new Set()
        depsMap.set(key, deps)
    }

    // deps.add(activeEffect)
    if (!deps.has(activeEffect)) {
        deps.add(activeEffect)
        activeEffect.deps.push(deps)
    }
}

function trigger(target, key) {
    const depsMap = targetMap.get(target)
    if (!depsMap) return

    const deps = depsMap.get(key)
    if (!deps) return

    // deps.forEach(effect => effect())
    deps.forEach(effect => {
        queueJob(effect)
    });
}