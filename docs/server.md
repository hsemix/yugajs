# Server Requests

YugaJS includes server-oriented directives for fetching HTML fragments, submitting forms, swapping content, updating scope state, and handling redirects.

## `ys-get`

Runs a GET request and swaps the response into a target.

```html
<button ys-get="/users" ys-target="#users" ys-swap="html">
    Load users
</button>

<div id="users"></div>
```

On a form, `ys-get` serializes form data into the query string.

```html
<form ys-get="/users/search" ys-target="#results">
    <input name="q">
    <button>Search</button>
</form>
```

## Request Triggers

```html
<div ys-get="/notifications" ys-trigger="load"></div>
<input name="q" ys-get="/search" ys-trigger="input" ys-target="#results">
<div ys-get="/stats" ys-trigger="every 5s"></div>
<div ys-get="/next-page" ys-trigger="intersect.once"></div>
```

`ys-trigger` works with GET and mutation directives. It accepts comma-separated triggers, any DOM event, and these special triggers:

- `load`
- `every 500ms` or `every 5s`
- `intersect` (also available as `visible`), with optional `.once` and `.threshold.0.5`

Event triggers support `.once`, `.prevent`, `.stop`, `.capture`, `.passive`, `.window`, `.document`, `.debounce[.duration]`, `.throttle[.duration]`, and keyboard modifiers such as `.enter`, `.escape`, `.ctrl`, and `.shift`.

```html
<input ys-get="/search" ys-trigger="input.debounce.300ms">
<button ys-post="/save" ys-trigger="click.once, keydown.ctrl.enter">Save</button>
```

Without `ys-trigger`, forms run on submit and other elements run on click.

## Server-powered Search

The playground uses `ys-trigger="input"` for search and select-style widgets.

```html
<div ys-data="{ selectedName: '', selectedId: '' }">
    <input
        name="search"
        placeholder="Search users..."
        autocomplete="off"
        ys-get="/select-users"
        ys-trigger="input"
        ys-target="#select-results"
        ys-swap="html">

    <div id="select-results"></div>

    <p>Selected: <strong ys-text="selectedName || 'None'"></strong></p>
    <input type="hidden" name="user_id" :value="selectedId">
</div>
```

## Mutation Directives

Use `ys-post`, `ys-put`, `ys-patch`, and `ys-delete` for the corresponding HTTP methods. They share response swapping, loading, validation, redirect, reset, and trigger behavior.

```html
<form ys-post="/users" ys-target="#users" ys-swap="append" ys-reset>
    <input name="name" placeholder="Name">
    <button ys-loading-text="Saving...">Save</button>
</form>

<ul id="users"></ul>
```

Forms are sent as `FormData`. Non-form elements send the current component state as JSON by default. Use `ys-send` to provide a specific payload or `ys-no-body` to omit it.

```html
<button ys-patch="/users/15" ys-send="{ active: false }">
    Deactivate
</button>

<button ys-delete="/users/15" ys-no-body>Delete</button>
```

## Headers and CSRF

Configure headers globally before calling `YS.start()`. `headers` may be an object or a function that returns an object. Per-request `ys-headers` expressions are supported by `ys-get` and override matching global values.

```html
<meta name="csrf-token" content="your-token">
<script>
YS.config({
    headers: { Accept: 'application/json' },
    csrf: true
})

YS.start()
</script>

<button ys-get="/profile" ys-headers="{ 'X-View': 'compact' }">
    Load profile
</button>
```

With `csrf: true`, YugaJS reads the `csrf-token` meta tag and sends it as `X-CSRF-TOKEN`. Customize those names with `csrf: { meta: 'csrf', header: 'X-CSRF' }`.

## Swap Strategies

Use `ys-swap` to choose how the response is applied.

| Strategy | Behavior |
| --- | --- |
| `html` | Replaces target `innerHTML` |
| `append` | Inserts response at the end of the target |
| `prepend` | Inserts response at the beginning of the target |
| `replace` | Replaces the target element |
| `outer` | Replaces the target element, or removes it for an empty response |
| `morph` | Morphs the target while preserving useful client-side state |

## Request Attributes

| Attribute | Use |
| --- | --- |
| `ys-target` | CSS selector for the response target |
| `ys-swap` | Swap strategy |
| `ys-trigger` | One or more request triggers and modifiers |
| `ys-send` | Evaluated JSON payload for non-form mutations |
| `ys-no-body` | Sends a mutation request without a body |
| `ys-headers` | Evaluated per-request headers for GET |
| `ys-cache` | GET cache time-to-live in seconds |
| `ys-loading-class` | Classes added during a mutation request |
| `ys-loading-text` | Temporary button or element text during a mutation request |
| `ys-reset` | Resets a form after a mutation completes |
| `ys-validate` | Applies JSON validation errors |

## Request Cache

Set `ys-cache` to cache a GET response for a number of seconds. Clear all cached responses with `YS.clearCache()`.

```html
<button ys-get="/cached-time" ys-target="#result" ys-cache="10">
    Load cached time
</button>

<button @click="YS.clearCache()">
    Clear cache
</button>

<div id="result"></div>
```

## File Uploads

For uploads, use a normal multipart form with `ys-post`. If the current scope has a `progress` property, upload progress is written to it.

```html
<body ys-data="{ progress: 0 }">
    <form
        ys-post="/upload"
        ys-target="#result"
        ys-swap="html"
        ys-reset
        enctype="multipart/form-data">

        <div class="dropzone" ys-dropzone="#file">
            Drop file here or click to choose
        </div>

        <input id="file" type="file" name="file" multiple ys-preview="#preview">
        <button>Upload</button>
    </form>

    <div class="bar" :style="`width:${progress}%`"></div>
    <p ys-text="progress + '%'"></p>
    <div id="preview"></div>
    <div id="result"></div>
</body>
```

## JSON Responses

YugaJS can update scope state and swap HTML from JSON responses.

```json
{
    "state": {
        "saved": true
    },
    "html": "<li>Aisha</li>"
}
```

Redirect with JSON:

```json
{
    "redirect": "/dashboard",
    "replace": false
}
```

Redirect with a header:

```txt
X-YS-Redirect: /dashboard
```

## Validation Responses

When an element has `ys-validate`, a JSON response like this applies validation errors:

```json
{
    "ok": false,
    "errors": {
        "email": "Email is required"
    }
}
```

Fields with errors receive `ys-invalid`. Error messages are inserted after fields with `ys-error-message`.

```css
[ys-invalid] {
    border: 1px solid red;
}

[ys-error-message] {
    color: red;
    font-size: 13px;
}
```

## Partial Navigation

Use `ys-visit` for app-style navigation that fetches a page fragment, swaps it into a target, and updates browser history.

```html
<a href="/settings" ys-visit ys-target="#app" ys-swap="morph">
    Settings
</a>

<main id="app"></main>
```

## Events

YugaJS emits request events that can be listened to with `YS.on`.

```js
YS.on('request:start', ({ url, method }) => {
    console.log('Starting', method, url)
})

YS.on('request:success', ({ response }) => {
    console.log('Saved', response)
})
```

Common events:

- `request:start`
- `request:success`
- `request:error`
- `request:finish`
- `request:validation-error`

The examples use request events for small UI side effects such as toasts after inline edits.

```js
YS.on('request:finish', ({ url }) => {
    if (url.includes('/delete-user')) {
        document.querySelector('#toast').innerHTML = 'User deleted'
    }
})
```
