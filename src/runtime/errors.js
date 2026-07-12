export function handleError(error, context = 'Unknown error') {
    console.error(`[YS] ${context}`, error)
}

export function warn(message, context = '') {
    console.warn(`[YS] ${context ? context + ': ' : ''}${message}`)
}