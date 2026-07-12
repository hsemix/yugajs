export function isTemplate(el) {
    return el instanceof HTMLTemplateElement
}

export function cloneTemplate(el) {
    if (isTemplate(el)) {
        return el.content.cloneNode(true)
    }

    return el.cloneNode(true)
}

export function firstElementFromFragment(fragment) {
    return [...fragment.childNodes].find(node => node instanceof Element)
}

export function insertFragmentBeforeEnd(fragment, end) {
    const nodes = [...fragment.childNodes]

    nodes.forEach(node => {
        end.parentNode.insertBefore(node, end)
    })

    return nodes
}