# YugaJS

YugaJS is a lightweight JavaScript library for building reactive, server-driven interfaces with plain HTML attributes.

It combines a few familiar ideas:

- jQuery-like DOM selection and helpers
- Alpine-style reactive component scopes
- htmx-style server requests and fragment swaps
- EventSource streaming
- DOM morphing for state-preserving updates
- a small plugin and component system

## Quick Example

```html
<div ys-data="{ count: 0 }">
    <button @click="count++">+</button>
    <button @click="count--">-</button>
    <strong ys-text="count"></strong>
</div>

<script src="/dist/ys.min.js"></script>
<script>
    YS.start()
</script>
```

## How It Works

A YugaJS app starts at elements with `ys-data` or `ys-component`. Those elements create reactive scopes. Directives inside the element read and write values from that scope.

```html
<div ys-data="{ name: 'Aisha', saving: false }">
    <input ys-model="name">
    <button :disabled="saving" @click="saving = true">
        Save <span ys-text="name"></span>
    </button>
</div>
```

Expressions run in the current scope and can access helpers such as `$el`, `$event`, `$store`, and `$watch` depending on context.

## Documentation

- [Installation](installation.md)
- [Core API](core.md)
- [Directives](directives.md)
- [Server Requests](server.md)
- [Streaming](streaming.md)
- [DOM Morphing](morphing.md)
- [Plugins](plugins.md)
- [Examples](examples.md)
- <a href="https://hsemix.github.io/yugajs/">See full documentation</a>
