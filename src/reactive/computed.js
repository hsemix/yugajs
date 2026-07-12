import { effect } from './effect.js'
import { reactive } from './reactive.js'

export function computed(getter) {
    const result = reactive({
        value: undefined
    })

    effect(() => {
        result.value = getter()
    })

    return result
}