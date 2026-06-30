# Examples

These examples use the browser build and call `YS.start()` after markup is ready.

## Counter

```html
<div ys-data="{ count: 0 }">
    <button @click="count--">-</button>
    <span ys-text="count"></span>
    <button @click="count++">+</button>
</div>

<script src="/dist/ys.min.js"></script>
<script>
    YS.start()
</script>
```

## Form Binding

```html
<div ys-data="{ name: '', enabled: false }">
    <input ys-model="name" placeholder="Name">

    <label>
        <input type="checkbox" ys-model="enabled">
        Enabled
    </label>

    <p>
        <span ys-text="name"></span>
        <span ys-show="enabled">is enabled</span>
    </p>
</div>
```

## List Rendering

```html
<div ys-data="{ newUser: '', users: ['Ali', 'Aisha', 'Musa'] }">
    <input ys-model="newUser">

    <button @click="users = [...users, newUser]; newUser = ''">
        Add
    </button>

    <ul>
        <li ys-for="user, index in users" ys-key="user">
            <span ys-text="user"></span>
            <button @click="users = users.filter((_, i) => i !== index)">
                Remove
            </button>
        </li>
    </ul>
</div>
```

## Template Rendering

Use `<template>` with `ys-if` and `ys-for` when you do not want the directive element itself rendered.

```html
<div ys-data="{ loggedIn: false, users: [{ name: 'Ali' }, { name: 'Aisha' }] }">
    <button @click="loggedIn = !loggedIn">Toggle login</button>

    <template ys-if="loggedIn">
        <div>Welcome back</div>
    </template>

    <ul>
        <template ys-for="user, index in users">
            <li>
                <span ys-text="index"></span>
                <span ys-text="user.name"></span>
            </li>
        </template>
    </ul>
</div>
```

## Classes And Attributes

```html
<div ys-data="{ active: false, disabled: false }">
    <button @click="active = !active">Toggle active</button>
    <button @click="disabled = !disabled">Toggle disabled</button>

    <button :disabled="disabled" ys-class="{ active: active }">
        Bound button
    </button>
</div>
```

## Server GET

```html
<button ys-get="/users" ys-target="#users" ys-swap="html">
    Load users
</button>

<div id="users"></div>
```

## Server Search

```html
<div ys-data="{ selectedName: '', selectedId: '' }">
    <input
        name="search"
        placeholder="Search users..."
        ys-get="/select-users"
        ys-trigger="input"
        ys-target="#select-results"
        ys-swap="html">

    <div id="select-results"></div>
    <strong ys-text="selectedName || 'None'"></strong>
    <input type="hidden" name="user_id" :value="selectedId">
</div>
```

## Server POST

```html
<form ys-post="/users" ys-target="#users" ys-swap="append" ys-reset>
    <input name="name" placeholder="Name">
    <button ys-loading-text="Saving...">Save</button>
</form>

<ul id="users"></ul>
```

## Upload With Preview And Progress

```html
<body ys-data="{ progress: 0 }">
    <form ys-post="/upload" ys-target="#result" ys-swap="html" enctype="multipart/form-data">
        <div ys-dropzone="#file">Drop file here or click to choose</div>
        <input id="file" type="file" name="file" multiple ys-preview="#preview">
        <button>Upload</button>
    </form>

    <div :style="`width:${progress}%`"></div>
    <p ys-text="progress + '%'"></p>
    <div id="preview"></div>
    <div id="result"></div>
</body>
```

## Keyboard Shortcuts

```html
<div ys-data="{ open: false, search: '' }">
    <div ys-key:ctrl+k.window="open = true" ys-key:escape.window="open = false"></div>

    <div ys-show="open" ys-cloak>
        <input ys-model="search" placeholder="Type search...">
        <button @click="open = false">Close</button>
    </div>
</div>
```

## Streaming

```html
<div ys-data="{ count: 0 }">
    <div ys-stream="/stream" ys-target="#messages" ys-swap="append"></div>

    <div id="messages"></div>
    <span ys-text="count"></span>
</div>
```

The server can send:

```txt
event: append
data: <p>New message</p>

event: signal
data: {"count": 2}
```

## Component

```html
<div ys-component="user-card" ys-props="{ name: 'Aisha' }">
    <button @click="toggle()">Toggle</button>
    <p ys-show="open" ys-text="props.name"></p>
</div>

<script src="/dist/ys.min.js"></script>
<script>
    YS.component('user-card', {
        data() {
            return { open: false }
        },
        methods: {
            toggle() {
                this.open = !this.open
            }
        }
    })

    YS.start()
</script>
```

## Component Props And Slots

```html
<div ys-component="user-card" ys-props="{ name: 'Aisha', email: 'aisha@example.com' }">
    <button @click="alert('Message ' + props.name)">
        Message user
    </button>
</div>

<template id="user-card-template">
    <h2 ys-text="props.name"></h2>
    <p ys-text="props.email"></p>
    <div ys-slot></div>
</template>

<script>
    YS.component('user-card', {
        init() {
            this.$el.innerHTML = document.querySelector('#user-card-template').innerHTML
        }
    })

    YS.start()
</script>
```

## Persistent Theme Store

```html
<body ys-data>
    <button @click="$store.settings.theme = 'light'">Light</button>
    <button @click="$store.settings.theme = 'dark'">Dark</button>
    <strong ys-text="$store.settings.theme"></strong>
    <div ys-effect="document.body.className = $store.settings.theme"></div>
</body>

<script>
    YS.store('settings', { theme: 'light' }, { persist: true })
    YS.start()
</script>
```
