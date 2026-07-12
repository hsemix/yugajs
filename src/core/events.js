import { YSCollection } from './collection.js'

YSCollection.prototype.on = function (event, selector, handler) {

    // Direct binding
    if (typeof selector === 'function') {

        return this.each(el => {
            el.addEventListener(event, selector)
        })
    }

    // Delegated binding
    return this.each(el => {

        el.addEventListener(event, e => {

            const target = e.target.closest(selector)

            if (target) {
                handler.call(target, e)
            }
        })
    })
}

// .trigger()
YSCollection.prototype.trigger = function (eventName, data = {}) {

    return this.each(el => {
        el.dispatchEvent(
            new Event(eventName, { bubbles: true, detail: data })
        );
    });

}

export function ready(callback) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback, {
            once: true
        })

        return
    }

    callback()
}