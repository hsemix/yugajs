import YS from '../ys.js'

export function start(container) {
    YS.compile(container)
}

export function nextTick() {
    return YS.nextTick()
}

export function mount(html, setup = null) {
    const container = document.createElement('div')
    container.innerHTML = html.trim()

    document.body.appendChild(container)

    if (typeof setup === 'function') {
        setup(container)
    }

    return {
        container,

        el(selector) {
            return container.querySelector(selector)
        },

        all(selector) {
            return [...container.querySelectorAll(selector)]
        },

        html() {
            return container.innerHTML
        },

        text(selector) {
            return container.querySelector(selector)?.textContent
        },

        destroy() {
            container.remove()
        }
    }
}

export function click(el) {
    el.dispatchEvent(
        new MouseEvent('click', {
            bubbles: true,
            cancelable: true
        })
    )
}

export function input(el, value) {

    el.value = value

    el.dispatchEvent(new Event('input', { bubbles: true }))
    el.dispatchEvent(new Event('change', { bubbles: true }))
}

export function change(el, value) {
    el.value = value

    el.dispatchEvent(
        new Event('change', {
            bubbles: true
        })
    )
}