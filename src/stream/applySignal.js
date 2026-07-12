export function applySignal(scope, payload = {}) {
    Object.entries(payload).forEach(([path, value]) => {
        setByPath(scope, path, value)
    })
}

function setByPath(obj, path, value) {
    const parts = path.split('.')
    const last = parts.pop()

    let target = obj

    parts.forEach(part => {
        if (!target[part] || typeof target[part] !== 'object') {
            target[part] = {}
        }

        target = target[part]
    })

    target[last] = value
}