# Directives

Directives are HTML attributes that connect DOM behavior to a YugaJS scope.

## Directive Syntax

```html
<button ys-on:click="count++">Add</button>
<button @click="count++">Add</button>

<button ys-bind:disabled="saving">Save</button>
<button :disabled="saving">Save</button>
```

Event directives support modifiers:

```html
<form @submit.prevent="save()"></form>
<button @click.once="confirm()">Confirm once</button>
<input @input.debounce="query = $event.target.value">
```

Supported modifiers are `prevent`, `stop`, `self`, `once`, and `debounce`.

## `ys-data`

Creates a reactive component scope.

```html
<div ys-data="{ count: 0 }">
    <button @click="count++">+</button>
    <span ys-text="count"></span>
</div>
```

## `ys-text`

Sets text content reactively.

```html
<p ys-text="message"></p>
```

## `ys-html`

Sets `innerHTML` reactively. Only use this with trusted HTML.

```html
<div ys-html="trustedMarkup"></div>
```

## `ys-model`

Creates two-way form bindings.

```html
<input ys-model="name">
<textarea ys-model="bio"></textarea>
<input type="checkbox" ys-model="enabled">
<input type="radio" value="admin" ys-model="role">
<select multiple ys-model="roles"></select>
```

File inputs write a `File` object, or an array of `File` objects when `multiple` is set.

Numbers and ranges write numeric values. Contenteditable elements write their `innerHTML`.

## `ys-bind` and `:`

Binds attributes to expressions.

```html
<button :disabled="saving">Save</button>
<a :href="'/users/' + user.id">View</a>
```

False, `null`, and `undefined` remove the attribute. `true` writes a boolean attribute.

## `ys-class`

Toggles or adds classes from strings, arrays, or objects.

```html
<p ys-class="{ active: selected, 'text-red bold': hasError }">
    Status
</p>
```

## `ys-show`

Toggles `display`.

```html
<div ys-show="open">Panel</div>
```

Add `ys-transition` and optional `ys-duration` for built-in enter and leave transitions.

```html
<div ys-show="open" ys-transition ys-duration="300">
    Animated panel
</div>
```

## `ys-if`

Mounts or removes content.

```html
<template ys-if="users.length === 0">
    <p>No users yet</p>
</template>
```

## `ys-for`

Loops over arrays.

```html
<ul>
    <li ys-for="user, index in users">
        <span ys-text="index"></span>
        <span ys-text="user.name"></span>
    </li>
</ul>
```

Use `ys-key` for stable DOM reuse.

```html
<li ys-for="user in users" ys-key="user.id">
    <span ys-text="user.name"></span>
</li>
```

`ys-for` also works on `<template>` when the loop should render more than one root node or avoid keeping the template element itself.

```html
<ul>
    <template ys-for="user, index in users">
        <li>
            <span ys-text="index"></span>
            <span ys-text="user.name"></span>
        </li>
    </template>
</ul>
```

## `ys-init`

Runs once when the element compiles.

```html
<div ys-init="loaded = true"></div>
```

## `ys-effect`

Runs an expression reactively whenever its dependencies change.

```html
<div ys-effect="console.log(count)"></div>
```

It is useful for syncing reactive state to APIs outside YugaJS.

```html
<body ys-data="{ theme: 'light' }">
    <button @click="theme = 'dark'">Dark</button>
    <div ys-effect="document.body.className = theme"></div>
</body>
```

## `ys-cloak`

Prevents uncompiled UI from flashing.

```html
<style>
    [ys-cloak] { display: none !important; }
</style>

<div ys-data="{ ready: true }" ys-cloak>
    Ready
</div>
```

## `ys-confirm`

Shows a native confirmation dialog before a click continues.

```html
<button ys-confirm="Delete this item?" ys-post="/delete">
    Delete
</button>
```

## `ys-key`

Runs an expression when a keyboard shortcut is pressed. The shortcut goes after `ys-key:` and may include `ctrl`, `cmd`, `meta`, `shift`, and `alt`.

```html
<div ys-data="{ open: false }">
    <div
        ys-key:ctrl+k.window="open = true"
        ys-key:escape.window="open = false">
    </div>

    <div ys-show="open" ys-cloak>
        Search panel
    </div>
</div>
```

Without the `.window` modifier, the listener is attached to `document`.

## `ys-teleport`

Moves an element into another DOM target.

```html
<div id="modals"></div>

<div ys-teleport="#modals">
    Modal content
</div>
```

## `ys-slot`

Renders captured component child markup inside a component template.

```html
<div ys-slot></div>
```

## `ys-preview`

Shows selected file previews in a target element.

```html
<input type="file" ys-preview="#preview" multiple>
<div id="preview"></div>
```

## `ys-dropzone`

Connects a drop area to a file input.

```html
<input id="files" type="file" multiple>
<div ys-dropzone="#files">
    Drop files here
</div>
```

While files are dragged over a dropzone, YugaJS adds a `ys-dragover` attribute that can be styled.

```css
.dropzone[ys-dragover] {
    border-color: green;
    background: #f0fff0;
}
```

## `ys-redirect`

Navigates when a button or link is clicked, or when a form is submitted.

```html
<button ys-redirect="/dashboard">
    Go to dashboard
</button>
```

## `ys-memo`

Skips recompiling a subtree while an expression remains unchanged.

```html
<div ys-memo="user.id">
    Expensive subtree
</div>
```
