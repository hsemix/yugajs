import { YSCollection } from "../core/collection.js";

YSCollection.prototype.css = function (property, value) {

    if (value === undefined && typeof property === 'string') {
        return getComputedStyle(this.elements[0])[property]
    }

    if (typeof property === 'object') {

        return this.each(el => {
            for (const [key, val] of Object.entries(property)) {
                el.style[key] = val
            }
        })
    }

    return this.each(el => {
        el.style[property] = value;
    })
}
