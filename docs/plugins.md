# Plugins

Plugins extend the `YS` object. A plugin can be a function or an object with an `install()` method.

Register plugins before calling `YS.start()`.

## Function Plugin

```js
function ToastPlugin(YS, options = {}) {
    YS.toast = message => {
        const el = document.createElement('div')
        el.textContent = message
        document.body.appendChild(el)

        setTimeout(() => {
            el.remove()
        }, options.duration || 2400)
    }
}

YS.use(ToastPlugin, { duration: 3000 })
YS.start()
```

## Object Plugin

```js
const LoggerPlugin = {
    name: 'logger',

    install(YS) {
        YS.log = (...args) => console.log('[YS]', ...args)
    }
}

YS.use(LoggerPlugin)
```

## Inline Plugin Alias

`YS.plugin()` is an alias for `YS.use()`.

```js
YS.plugin(YS => {
    YS.sayHello = () => 'Hello'
})
```

## Collection Plugins

Use `YS.fn()` to add methods to YugaJS collections.

```js
YS.fn('highlight', function () {
    return this.each(el => {
        el.style.outline = '2px solid #137b67'
    })
})

$('.card').highlight()
```

## Custom Directives

Use `YS.directive()` to register new directives.

```js
YS.directive('focus', {
    mounted(el) {
        el.focus()
    }
})
```

Directive definitions may include:

- `priority`
- `structural`
- `mounted(el, binding, scope)`
- `updated(el, binding, scope)`
- `cleanup(el, binding, scope)`

If you pass a function, it is treated as the directive's mounted handler.

```js
YS.directive('log', (el, binding, scope) => {
    console.log(binding.expression, scope)
})
```

## Installed Plugins

```js
console.log(YS.plugins())
```

YugaJS tracks installed plugins and avoids installing the same plugin twice.

## Headless Components Plugin

The built-in `YS.headless` plugin registers behavior-only components:

- `headless-tabs`
- `headless-disclosure`
- `headless-dialog`
- `headless-dropdown`
- `headless-toggle`
- `headless-popover`
- `headless-menu`
- `headless-combobox`
- `headless-listbox`

```js
YS.use(YS.headless)
YS.start()
```
