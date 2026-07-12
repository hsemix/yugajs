import { describe, it, expect } from 'vitest'
import YS from '../src/ys.js'
import { mount, click, nextTick } from '../src/testing/index.js'

describe('@on modifiers', () => {

    it('.prevent calls preventDefault on the event', async () => {
        const app = mount(`
            <div ys-data="{}">
                <form @submit.prevent="">
                    <button type="submit">go</button>
                </form>
            </div>
        `)

        YS.compile(app.container)
        await nextTick()

        const event = new Event('submit', { bubbles: true, cancelable: true })
        const notCanceled = app.el('form').dispatchEvent(event)

        expect(notCanceled).toBe(false)
        expect(event.defaultPrevented).toBe(true)

        app.destroy()
    })

    it('.stop keeps the event from reaching ancestor listeners', async () => {
        const app = mount(`
            <div ys-data="{ outer: 0, inner: 0 }">
                <div @click="outer++">
                    <button @click.stop="inner++">go</button>
                </div>
            </div>
        `)

        YS.compile(app.container)
        await nextTick()

        click(app.el('button'))
        await nextTick()

        const scope = app.el('[ys-data]').__ysScope
        expect(scope.inner).toBe(1)
        expect(scope.outer).toBe(0)

        app.destroy()
    })

    it('.once only fires the handler on the first event', async () => {
        const app = mount(`
            <div ys-data="{ count: 0 }">
                <button @click.once="count++">go</button>
            </div>
        `)

        YS.compile(app.container)
        await nextTick()

        click(app.el('button'))
        click(app.el('button'))
        click(app.el('button'))
        await nextTick()

        const scope = app.el('[ys-data]').__ysScope
        expect(scope.count).toBe(1)

        app.destroy()
    })

    it('.outside fires only when the click lands outside the element', async () => {
        const app = mount(`
            <div ys-data="{ closed: 0 }">
                <div id="panel" @click.outside="closed++">panel</div>
                <button id="elsewhere">elsewhere</button>
            </div>
        `)

        YS.compile(app.container)
        await nextTick()

        click(app.el('#panel'))
        await nextTick()

        const scope = app.el('[ys-data]').__ysScope
        expect(scope.closed).toBe(0)

        click(app.el('#elsewhere'))
        await nextTick()

        expect(scope.closed).toBe(1)

        app.destroy()
    })
})
