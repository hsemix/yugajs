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

## Headless Components

Install the headless plugin before starting YugaJS. Headless components provide state and methods; you provide markup, styling, transitions, and accessibility attributes.

```html
<script src="/dist/ys.min.js"></script>
<script>
    YS.use(YS.headless)
    YS.start()
</script>
```

### Headless Tabs

```html
<div ys-component="headless-tabs" ys-props="{ defaultValue: 'settings' }">
    <div role="tablist">
        <button
            role="tab"
            @click="select('overview')"
            :aria-selected="isSelected('overview')"
            ys-class="{ active: isSelected('overview') }">
            Overview
        </button>

        <button
            role="tab"
            @click="select('settings')"
            :aria-selected="isSelected('settings')"
            ys-class="{ active: isSelected('settings') }">
            Settings
        </button>
    </div>

    <section role="tabpanel" ys-show="isSelected('overview')" ys-cloak>
        Overview content
    </section>

    <section role="tabpanel" ys-show="isSelected('settings')" ys-cloak>
        Settings content
    </section>
</div>
```

### Headless Dialog

```html
<div ys-component="headless-dialog" ys-key:escape.window="close()">
    <button @click="show()">Open dialog</button>

    <div ys-show="open" ys-transition ys-cloak @click.self="close()">
        <section role="dialog" aria-modal="true" aria-labelledby="dialog-title">
            <h2 id="dialog-title">Delete user</h2>
            <p>This action cannot be undone.</p>

            <button @click="close()">Cancel</button>
            <button ys-post="/users/delete" @click="close()">Delete</button>
        </section>
    </div>
</div>
```

### Headless Menu

```html
<div
    ys-component="headless-menu"
    ys-data="{ items: ['Profile', 'Settings', 'Logout'], selected: '' }"
    ys-key:arrowdown="next(items.length)"
    ys-key:arrowup="prev(items.length)"
    ys-key:escape="close()">

    <button @click="toggle()">Open menu</button>

    <div role="menu" ys-show="open" ys-cloak>
        <button
            role="menuitem"
            ys-for="item, index in items"
            ys-class="{ active: activeIndex === index }"
            @mouseenter="activeIndex = index"
            @click="selected = item; close()">
            <span ys-text="item"></span>
        </button>
    </div>

    <p>Selected: <span ys-text="selected || 'None'"></span></p>
</div>
```

### Headless Listbox

```html
<div
    ys-component="headless-listbox"
    ys-props="{ defaultValue: 'pro' }"
    ys-data="{ plans: ['free', 'pro', 'enterprise'] }">

    <button @click="toggle()" :aria-expanded="open">
        <span ys-text="value || 'Choose plan'"></span>
    </button>

    <div role="listbox" ys-show="open" ys-cloak>
        <button
            role="option"
            ys-for="plan in plans"
            :aria-selected="value === plan"
            ys-class="{ active: value === plan }"
            @click="select(plan)">
            <span ys-text="plan"></span>
        </button>
    </div>
</div>
```

### Headless Combobox

```html
<div
    ys-component="headless-combobox"
    ys-data="{ people: ['Ali', 'Aisha', 'Musa', 'Hamid'] }"
    ys-key:escape="close()">

    <input
        ys-model="query"
        @focus="show()"
        placeholder="Search people">

    <div role="listbox" ys-show="open" ys-cloak>
        <button
            role="option"
            ys-for="person in people.filter(name => name.toLowerCase().includes(query.toLowerCase()))"
            @click="select(person); query = person">
            <span ys-text="person"></span>
        </button>
    </div>

    <p>Selected: <span ys-text="selected || 'None'"></span></p>
</div>
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
