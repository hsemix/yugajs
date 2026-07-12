export function startLoading(el) {
    el.setAttribute('ys-loading', '')

    const loadingClass = el.getAttribute('ys-loading-class')
    const loadingText = el.getAttribute('ys-loading-text')

    if (loadingClass) {
        el.__ysLoadingClass = loadingClass
        el.classList.add(...loadingClass.split(' '))
    }

    if (loadingText) {
        el.__ysOriginalText = el.textContent
        el.textContent = loadingText
    }
}

export function stopLoading(el) {
    el.removeAttribute('ys-loading')

    if (el.__ysLoadingClass) {
        el.classList.remove(...el.__ysLoadingClass.split(' '))
        delete el.__ysLoadingClass
    }

    if (el.__ysOriginalText !== undefined) {
        el.textContent = el.__ysOriginalText
        delete el.__ysOriginalText
    }
}