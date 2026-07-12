import { YSCollection } from '../core/collection.js'

YSCollection.prototype.attr = function (name, value) {

    if (value === undefined) {
        return this.elements[0]?.getAttribute(name)
    }

    return this.each(el => {
        el.setAttribute(name, value)
    })
}