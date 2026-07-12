import { handleError } from '../runtime/errors.js'

export function evaluate(expression, scope = {}, extra = {}) {
    try {
        return Function(
            '$scope',
            '$extra',
            `
            const $event = $extra.$event
            const $el = $extra.$el

            with ($scope) {
                return (${expression})
            }
            `
        )(scope, extra)
    } catch (error) {
        handleError(error, `evaluate "${expression}"`)
        return undefined
    }
}

export function execute(expression, scope = {}, extra = {}) {
    try {
        return Function(
            '$scope',
            '$extra',
            `
            const $event = $extra.$event
            const $el = $extra.$el

            with ($scope) {
                ${expression}
            }
            `
        )(scope, extra)
    } catch (error) {
        handleError(error, `execute "${expression}"`)
    }
}