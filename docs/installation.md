# Installation

YugaJS can run directly in the browser from the built file, or from the source entry while developing with Vite.

## Browser Script

```html
<script src="/dist/ys.min.js"></script>
<script>
    YS.start()
</script>
```

The browser build exposes both `YS` and `$` globally.

## Vite Development

```html
<script type="module" src="/dist/ys.module.js"></script>
<script type="module">
    YS.start()
</script>
```

## Local Development

Install dependencies:

```bash
npm install
```

Start the Vite dev server:

```bash
npm run dev
```

Build the library:

```bash
npm run build
```

Run tests:

```bash
npm test
```

Preview the generated docs site:

```bash
npm run docs:serve
```

Then open `http://localhost:8080`.

## Startup Order

Register plugins, custom directives, and components before calling `YS.start()`.

```html
<script src="/dist/ys.min.js"></script>
<script>
    YS.component('counter-button', {
        data() {
            return { count: 0 }
        }
    })

    YS.start()
</script>
```
