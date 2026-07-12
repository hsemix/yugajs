export function closestData(el) {

    while (el) {

        if (el.$data) {
            return el.$data
        }

        el = el.parentElement
    }

    return {}
}