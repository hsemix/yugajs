import { YSCollection } from '../core/collection.js'

// .val() - Get the current value of the first element in the set of matched elements or set the value of every matched element.
YSCollection.prototype.val = function (value) {

    if (value === undefined) {
        return this.elements[0]?.value
    }

    return this.each(el => {
        el.value = value
    });
}

// .serialize() - Encode a set of form elements as a string for submission.
YSCollection.prototype.serialize = function () {

    const form = this.elements[0];
    if (!form || form.tagName !== 'FORM') {
        throw new Error('serialize can only be called on a form element');
    }

    const formData = new FormData(form);
    // const params = new URLSearchParams();

    // for (const [key, value] of formData.entries()) {
    //     params.append(key, value);
    // }

    // return params.toString();

    return Object.fromEntries(formData.entries());
}

// .append() - Insert content, specified by the parameter, to the end of each element in the set of matched elements.
YSCollection.prototype.append = function (content) {

    return this.each(el => {
        // el.insertAdjacentHTML('beforeend', content);
        if (content instanceof Element) {
            el.appendChild(content);
        } else if (typeof content === 'string') {
            el.insertAdjacentHTML('beforeend', content);
        } else if (content instanceof YSCollection) {
            content.each(child => {
                el.appendChild(child);
            });
        }
    });
}

// .prepend() - Insert content, specified by the parameter, to the beginning of each element in the set of matched elements.

YSCollection.prototype.prepend = function (content) {

    return this.each(el => {
        // el.insertAdjacentHTML('afterbegin', content);
        if (content instanceof Element) {
            el.insertBefore(content, el.firstChild);
        } else if (typeof content === 'string') {
            el.insertAdjacentHTML('afterbegin', content);
        } else if (content instanceof YSCollection) {
            content.each(child => {
                el.insertBefore(child, el.firstChild);
            });
        }
    });
}

YSCollection.prototype.appendTo = function (target) {

    const parent = $(target)

    parent.append(this.elements[0])

    return this
}

// .before() - Insert content, specified by the parameter, before each element in the set of matched elements.

YSCollection.prototype.before = function (content) {

    return this.each(el => {
        if (content instanceof Element) {
            el.parentNode.insertBefore(content, el);
        } else if (typeof content === 'string') {
            el.insertAdjacentHTML('beforebegin', content);
        } else if (content instanceof YSCollection) {
            content.each(sibling => {
                el.parentNode.insertBefore(sibling, el);
            });
        }
    });
}

// .after() - Insert content, specified by the parameter, after each element in the set of matched elements.

YSCollection.prototype.after = function (content) {

    return this.each(el => {
        if (content instanceof Element) {
            el.parentNode.insertBefore(content, el.nextSibling);
        } else if (typeof content === 'string') {
            el.insertAdjacentHTML('afterend', content);
        } else if (content instanceof YSCollection) {
            content.each(sibling => {
                el.parentNode.insertBefore(sibling, el.nextSibling);
            });
        }
    });

}

// .remove() - Remove the set of matched elements from the DOM.
YSCollection.prototype.remove = function () {

    return this.each(el => {
        el.remove();
    });
}
