# Core API

YugaJS exposes a global `YS` object and a `$` selector helper. In the current build, both point to the same API object.

## Selecting Elements

```js
$('.btn').on('click', event => {
    console.log('Clicked', event.currentTarget)
})
```

The `$()` helper accepts:

- a CSS selector
- a single element
- `window` or `document`
- an array or `NodeList`
- a ready callback

```js
$(document).ready(() => {
    console.log('DOM ready')
})

$(() => {
    console.log('Also DOM ready')
})
```

## Collections

Collections are iterable and chain most mutating methods.

```js
$('.item')
    .addClass('ready')
    .attr('data-loaded', 'true')
    .show()
```

Common methods:

| Category | Methods |
| --- | --- |
| Collection | `each`, `filter`, `first`, `last`, `eq`, `toArray` |
| Events | `on`, delegated `on`, `trigger`, `ready` |
| Content | `html`, `text`, `val`, `serialize` |
| Attributes | `attr`, `data`, `css` |
| Classes | `addClass`, `removeClass`, `toggleClass`, `hasClass` |
| Display | `show`, `hide`, `toggle`, `fadeIn`, `fadeOut`, `fadeToggle` |
| Traversal | `find`, `parent`, `children`, `closest`, `siblings`, `parents` |
| Insertion | `append`, `prepend`, `appendTo`, `before`, `after`, `remove` |

## Requests

```js
await YS.get('/users')
await YS.post('/users', { name: 'Aisha' })
await YS.put('/users/1', { name: 'Aisha' })
await YS.delete('/users/1')
```

Low-level requests use `XMLHttpRequest` and return an object with:

- `ok`
- `status`
- `type`
- `data`
- `headers.redirect`

## Runtime Helpers

```js
YS.nextTick(() => {
    console.log('Reactive jobs have flushed')
})

const scope = YS.scope('#counter')

YS.redirect('/dashboard')
YS.clearCache()
```

Useful helpers include:

- `YS.start()`
- `YS.compile(root)`
- `YS.observe(root)`
- `YS.nextTick(callback)`
- `YS.scope(selectorOrElement)`
- `YS.data(selectorOrElement, state)`
- `YS.request(url, options)`
- `YS.morph(target, html)`
- `YS.redirect(url, replace)`
- `YS.clearCache(key)`
- `YS.debounce(fn, delay)`
- `YS.throttle(fn, limit)`
- `YS.uuid()`
- `YS.parseHTML(html)`

## Reactivity

```js
const store = YS.store('settings', {
    theme: 'light'
}, { persist: true })

YS.watch(
    () => store.theme,
    theme => console.log('Theme changed:', theme)
)

store.theme = 'dark'
```

Reactive APIs:

- `YS.store(name, value, options)`
- `YS.clearStore(name)`
- `YS.effect(callback)`
- `YS.watch(getter, callback)`
- `YS.computed(getter)`
- `YS.signal(value)`
- `YS.signalEffect(callback)`

## Stores In Markup

Stores are available inside component scopes as `$store`.

```html
<div ys-data>
    <button @click="$store.counter.count++">+</button>
    <span ys-text="$store.counter.count"></span>
</div>

<script>
    YS.store('counter', { count: 0 })
    YS.start()
</script>
```

## Persistent Stores

Pass `{ persist: true }` to save a store in `localStorage`.

```js
YS.store('settings', {
    theme: 'light'
}, {
    persist: true
})
```

```html
<button @click="$store.settings.theme = 'light'">Light</button>
<button @click="$store.settings.theme = 'dark'">Dark</button>
<div ys-effect="document.body.className = $store.settings.theme"></div>
```

## Reading A Scope

`YS.scope()` is useful when plain JavaScript needs to interact with a component.

```html
<div id="toast-app" ys-data="{ toasts: [] }">
    <button @click="toasts = [...toasts, { id: Date.now(), message: 'Saved' }]">
        Show toast
    </button>
</div>
```

```js
YS.start()

const scope = YS.scope('#toast-app')

YS.watch(
    () => scope.toasts,
    toasts => {
        toasts.forEach(toast => {
            if (toast._timeout) return
            toast._timeout = true

            setTimeout(() => {
                scope.toasts = scope.toasts.filter(item => item.id !== toast.id)
            }, 3000)
        })
    }
)
```

## Programmatic Data

Use `YS.data()` to attach a scope from JavaScript.

```html
<div id="counter">
    <button @click="count--">-</button>
    <span ys-text="count"></span>
    <button @click="count++">+</button>
</div>
```

```js
YS.data('#counter', { count: 20 })
YS.start()
```
