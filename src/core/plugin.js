import { YSCollection } from './collection.js';

export function collectionPlugin(name, callback) {

    YSCollection.prototype[name] = callback
}