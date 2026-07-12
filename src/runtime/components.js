const components = new Map()

export function component(name, definition) {
    components.set(name, definition)
}

export function getComponent(name) {
    return components.get(name)
}