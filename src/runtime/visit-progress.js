let bar = null
let timer = null

export function startVisitProgress() {
    ensureProgressBar()

    clearTimeout(timer)

    bar.style.opacity = '1'
    bar.style.width = '12%'

    requestAnimationFrame(() => {
        bar.style.width = '72%'
    })
}

export function finishVisitProgress() {
    if (!bar) return

    clearTimeout(timer)

    bar.style.width = '100%'

    timer = setTimeout(() => {
        bar.style.opacity = '0'

        setTimeout(() => {
            if (bar) {
                bar.style.width = '0'
            }
        }, 200)
    }, 150)
}

function ensureProgressBar() {
    if (bar) return

    bar = document.createElement('div')

    bar.setAttribute('data-ys-visit-progress', '')

    Object.assign(bar.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        zIndex: '999999',
        height: '3px',
        width: '0',
        opacity: '0',
        background: 'currentColor',
        color: '#f59e0b',
        transition:
            'width 220ms ease, opacity 180ms ease',
        pointerEvents: 'none'
    })

    document.body.appendChild(bar)
}