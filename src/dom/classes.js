import { YSCollection } from '../core/collection.js'

YSCollection.prototype.addClass = function (className) {

    return this.each(el => {
        el.classList.add(className)
    })
}

YSCollection.prototype.removeClass = function (className) {

    return this.each(el => {
        el.classList.remove(className)
    })
}

YSCollection.prototype.toggleClass = function (className) {

    return this.each(el => {
        el.classList.toggle(className)
    })
}

YSCollection.prototype.hasClass = function (className) {

    return this.elements[0]
        ?.classList
        .contains(className)
}