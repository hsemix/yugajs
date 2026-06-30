# DOM Morphing

YugaJS includes DOM morphing for updates that should preserve useful client-side state while still applying server-rendered HTML.

Morphing is used through:

- the `ys-swap="morph"` request strategy
- the `morph` stream command
- the `YS.morph(target, html)` helper

## Request Morphing

```html
<button ys-get="/profile" ys-target="#profile" ys-swap="morph">
    Refresh profile
</button>

<section id="profile">
    Current profile markup
</section>
```

## Programmatic Morphing

```js
YS.morph(
    document.querySelector('#profile'),
    '<section id="profile"><h2>Aisha</h2></section>'
)
```

The incoming HTML should contain a single root element that matches the target you want to morph.

## What Morphing Preserves

During morphing, YugaJS preserves form control values for:

- `input`
- `textarea`
- `select`

It also preserves attributes owned by reactive directives such as:

- `ys-class`
- `ys-show`
- `ys-bind`
- `ys-cloak`

This prevents server-rendered markup from immediately overwriting the latest client-side reactive state.

## Compilation After Morphs

New or updated elements are compiled after morphing, so directives inside incoming markup become active.

```html
<div id="target">
    <button @click="count++">+</button>
</div>
```

If the morphed markup contains new directives, YugaJS compiles them automatically.

## When To Use Morphing

Use `morph` when:

- the target contains inputs the user may be editing
- you want to preserve focus or client-side state
- you are replacing a larger component with server-rendered markup

Use `html`, `append`, or `prepend` when the response is a simple fragment and preserving existing DOM state is not important.
