# Streaming

YugaJS can consume Server-Sent Events with `ys-stream`. Incoming events can append HTML, replace fragments, morph DOM, update reactive state, dispatch browser events, redirect, focus fields, or close the stream.

## Basic Stream

```html
<div ys-data>
    <div ys-stream="/stream" ys-target="#messages" ys-swap="append"></div>
    <div id="messages">Waiting...</div>
</div>
```

The default `message` event uses the element's `ys-swap` value. If no swap mode is provided, it defaults to `append`.

## Stream Commands

| Event name | Behavior |
| --- | --- |
| `message` | Swaps event data with the default swap strategy |
| `append` | Appends event data to the target |
| `prepend` | Prepends event data to the target |
| `html` | Replaces target `innerHTML` |
| `replace` | Replaces the target element |
| `morph` | Morphs the target using the event data |
| `signal` | Parses JSON and applies it to the current scope |
| `dispatch` | Dispatches a browser `CustomEvent` |
| `redirect` | Navigates to the event data URL |
| `focus` | Focuses the selector in the event data |
| `close` | Closes the EventSource connection |

## Server-Sent Event Examples

Append HTML:

```txt
event: append
data: <p>New message</p>
```

Patch component state:

```txt
event: signal
data: {"count": 12}
```

Dispatch a browser event:

```txt
event: dispatch
data: {"event":"toast","detail":{"message":"Saved"}}
```

Redirect:

```txt
event: redirect
data: /dashboard
```

## Stream Actions

Use `ys-stream-action` inside a stream context to send actions back to the server.

```html
<div ys-stream="/chat/stream" ys-action-url="/chat/action">
    <button ys-stream-action="like">Like</button>
</div>
```

The action request posts JSON:

```json
{
    "action": "like",
    "state": {
        "count": 1
    }
}
```

JSON action responses may update state:

```json
{
    "state": {
        "liked": true
    },
    "signal": {
        "count": 2
    }
}
```

## SSE Signals

`ys-sse-signals` opens a stream dedicated to updating scopes elsewhere on the page.

```html
<div id="counter" ys-data="{ count: 0 }">
    <span ys-text="count"></span>
</div>

<div ys-sse-signals="/signals"></div>
```

Expected payload:

```json
{
    "target": "#counter",
    "signals": {
        "count": 10
    }
}
```

## Stream Events

Listen to runtime stream events with `YS.on`.

```js
YS.on('stream:start', ({ url }) => {
    console.log('Started stream', url)
})

YS.on('stream:message', ({ command, data }) => {
    console.log(command, data)
})
```

Common events:

- `stream:start`
- `stream:message`
- `stream:signal`
- `stream:dispatch`
- `stream:error`
- `stream:close`
- `stream:action:start`
- `stream:action:success`
- `stream:action:error`
