import { YSCollection } from '../core/collection.js'

YSCollection.prototype.html = function (content) {

    if (content === undefined) {
        return this.elements[0]?.innerHTML
    }

    return this.each(el => {
        el.innerHTML = content
    })
}

YSCollection.prototype.text = function (content) {

    if (content === undefined) {
        return this.elements[0]?.textContent
    }

    return this.each(el => {
        el.textContent = content
    })
}