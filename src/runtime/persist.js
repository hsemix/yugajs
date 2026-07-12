export function capturePersistentElements(root = document) {
    const persisted = new Map()

    root
        .querySelectorAll('[ys-persist]')
        .forEach(el => {
            const key = getPersistKey(el)

            if (!key) {
                console.warn(
                    '[YS] ys-persist requires a unique value:',
                    el
                )

                return
            }

            persisted.set(key, el)
        })

    return persisted
}

export function restorePersistentElements(
    root,
    persisted
) {
    persisted.forEach((oldElement, key) => {
        const placeholder = findPersistentElement(
            root,
            key
        )

        if (!placeholder) {
            return
        }

        placeholder.replaceWith(oldElement)
    })
}

function findPersistentElement(root, key) {
    return Array.from(
        root.querySelectorAll('[ys-persist]')
    ).find(el => getPersistKey(el) === key)
}

function getPersistKey(el) {
    return el.getAttribute('ys-persist')?.trim()
}