const directives = new Map()

export function directive(name, definition) {
    if (typeof definition === 'function') {
        definition = {
            mounted: definition
        }
    }

    if (definition.handler && !definition.mounted) {
        definition.mounted = definition.handler
    }

    directives.set(name, {
        priority: definition.priority ?? 0,
        structural: definition.structural ?? false,
        mounted: definition.mounted ?? null,
        updated: definition.updated ?? null,
        cleanup: definition.cleanup ?? null
    })
}

export function getDirective(name) {
    return directives.get(name)
}