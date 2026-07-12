export function transitionShow(el, show) {
    if (!el.hasAttribute('ys-transition')) {
        el.style.display = show ? '' : 'none'
        return
    }

    if (show) {
        enter(el)
        return
    }

    leave(el, () => {
        el.style.display = 'none'
    })
}

export function enter(el, done = () => { }) {
    const duration = Number(el.getAttribute('ys-duration') || 200)

    el.style.display = ''
    el.style.opacity = '0'
    el.style.transform = 'scale(0.98)'
    el.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`

    requestAnimationFrame(() => {
        el.style.opacity = '1'
        el.style.transform = 'scale(1)'

        setTimeout(done, duration)
    })
}

export function leave(el, done = () => { }) {
    const duration = Number(el.getAttribute('ys-duration') || 200)

    el.style.opacity = '0'
    el.style.transform = 'scale(0.98)'
    el.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`

    setTimeout(done, duration)
}

export function enterListNode(node) {
    if (!(node instanceof Element)) return

    const duration = Number(node.getAttribute('ys-duration') || 200)

    node.style.opacity = '0'
    node.style.transform = 'translateY(-6px)'
    node.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`

    requestAnimationFrame(() => {
        node.style.opacity = '1'
        node.style.transform = 'translateY(0)'
    })
}

export function leaveListNode(node, done = () => { }) {
    if (!(node instanceof Element)) {
        node.remove()
        done()
        return
    }

    const duration = Number(node.getAttribute('ys-duration') || 200)

    node.style.opacity = '0'
    node.style.transform = 'translateY(-6px)'
    node.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`

    setTimeout(() => {
        node.remove()
        done()
    }, duration)
}

export function recordPositions(nodes) {
    const positions = new Map()

    nodes.forEach(node => {
        if (!(node instanceof Element)) return

        positions.set(node, node.getBoundingClientRect())
    })

    return positions
}

export function animateMoves(nodes, oldPositions) {
    nodes.forEach(node => {
        if (!(node instanceof Element)) return

        const oldBox = oldPositions.get(node)

        if (!oldBox) return

        const newBox = node.getBoundingClientRect()

        const dx = oldBox.left - newBox.left
        const dy = oldBox.top - newBox.top

        if (dx === 0 && dy === 0) return

        node.style.transform = `translate(${dx}px, ${dy}px)`
        node.style.transition = 'transform 0s'

        requestAnimationFrame(() => {
            node.style.transform = ''
            node.style.transition = 'transform 250ms ease'
        })
    })
}
