import { YSCollection } from "../core/collection.js";

YSCollection.prototype.data = function (key, value) {

    if (value === undefined) {
        return this.elements[0]?.dataset[key]
    }

    return this.each(el => {
        el.dataset[key] = value
    })
}