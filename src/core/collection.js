export class YSCollection {
    constructor(elements = []) {
        this.elements = elements
    }

    get length() {
        return this.elements.length
    }

    ready(callback) {
        if (this.elements[0] === document) {
            return $.ready(callback)
        }

        return this
    }

    each(callback) {
        this.elements.forEach((el, index) => {
            callback.call(el, el, index)
        })

        return this
    }

    filter(callback) {

        return new YSCollection(
            this.elements.filter(callback)
        )
    }

    first() {
        return new YSCollection([
            this.elements[0]
        ])
    }

    last() {
        return new YSCollection([
            this.elements[this.elements.length - 1]
        ])
    }

    eq(index) {
        return new YSCollection([
            this.elements[index]
        ])
    }

    toArray() {
        return this.elements
    }

    [Symbol.iterator]() {
        return this.elements.values()
    }
}