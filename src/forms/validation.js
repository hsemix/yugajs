export function clearValidationErrors(form) {
    form.querySelectorAll('[ys-error-message]').forEach(el => {
        el.remove()
    })

    form.querySelectorAll('[ys-invalid]').forEach(el => {
        el.removeAttribute('ys-invalid')
    })
}

export function applyValidationErrors(form, errors = {}) {
    clearValidationErrors(form)

    Object.entries(errors).forEach(([name, message]) => {
        const field = form.querySelector(`[name="${CSS.escape(name)}"]`)

        if (!field) return

        field.setAttribute('ys-invalid', '')

        const error = document.createElement('div')
        error.setAttribute('ys-error-message', '')
        error.textContent = message

        field.insertAdjacentElement('afterend', error)
    })
}