import { YSCollection } from "../core/collection.js";

// .find()
YSCollection.prototype.find = function (selector) {

    let results = [];

    this.each(el => {
        results.push(...el.querySelectorAll(selector))
    });

    return new YSCollection(results);
}

// .parent()
YSCollection.prototype.parent = function () {

    // const parents = new Set();

    // this.each(el => {
    //     if (el.parentElement) {
    //         parents.add(el.parentElement);
    //     }
    // });

    // return new YSCollection([...parents]);

    const parents = this.elements.map(el => el.parentElement);

    return new YSCollection(parents.filter(parent => parent !== null));
}

// .children()
YSCollection.prototype.children = function () {

    let children = [];

    this.each(el => {
        children.push(...el.children);
    });

    return new YSCollection(children);
}

// .closet()
YSCollection.prototype.closest = function (selector) {
    // let closestElements = [];

    // this.each(el => {
    //     const closest = el.closest(selector);
    //     if (closest) {
    //         closestElements.push(closest);
    //     }
    // });

    // return new YSCollection(closestElements);

    const results = this.elements.map(el => el.closest(selector)).filter(el => el !== null);

    return new YSCollection(results);
}

// .eq()
YSCollection.prototype.eq = function (index) {
    const el = this.elements[index];
    return new YSCollection(el ? [el] : []);
}

// .first()
YSCollection.prototype.first = function () {
    return this.eq(0);
}

// .last()
YSCollection.prototype.last = function () {
    return this.eq(this.elements.length - 1);
}

// .siblings()
YSCollection.prototype.siblings = function () {
    let siblings = [];

    this.each(el => {
        const parent = el.parentElement;
        if (parent) {
            siblings.push(...parent.children);
        }
    });

    // Remove duplicates and the original elements
    const uniqueSiblings = [...new Set(siblings)].filter(sib => !this.elements.includes(sib));

    return new YSCollection(uniqueSiblings);
}

// .parents(selector)
YSCollection.prototype.parents = function (selector) {
    let parents = [];

    this.each(el => {
        let parent = el.parentElement;
        while (parent) {
            if (!selector || parent.matches(selector)) {
                parents.push(parent);
            }
            parent = parent.parentElement;
        }
    });

    const uniqueParents = [...new Set(parents)];
    return new YSCollection(uniqueParents);
}