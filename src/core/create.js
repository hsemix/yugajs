import { YSCollection } from './collection.js'

export function create(tag) {

    return new YSCollection([
        document.createElement(tag)
    ])
}