import { describe, it, expect } from 'vitest'
import YS from '../src/ys.js'
import { mount, click, nextTick } from '../src/testing/index.js'

describe('ys-if', () => {

    it('mounts the element when the expression is truthy', async () => {
        const app = mount(`
            <div ys-data="{ show: true }">
                <p ys-if="show">visible</p>
            </div>
        `)

        YS.compile(app.container)
        await nextTick()

        expect(app.el('p')).not.toBeNull()
        expect(app.text('p')).toBe('visible')

        app.destroy()
    })

    it('does not mount the element when the expression is falsy', async () => {
        const app = mount(`
            <div ys-data="{ show: false }">
                <p ys-if="show">visible</p>
            </div>
        `)

        YS.compile(app.container)
        await nextTick()

        expect(app.el('p')).toBeNull()

        app.destroy()
    })

    it('adds and removes the element as the condition toggles', async () => {
        const app = mount(`
            <div ys-data="{ show: false }">
                <button @click="show = !show">toggle</button>
                <p ys-if="show">visible</p>
            </div>
        `)

        YS.compile(app.container)
        await nextTick()

        expect(app.el('p')).toBeNull()

        click(app.el('button'))
        await nextTick()
        expect(app.el('p')).not.toBeNull()

        click(app.el('button'))
        await nextTick()
        expect(app.el('p')).toBeNull()

        app.destroy()
    })

    it('compiles directives inside the conditional block against the parent scope', async () => {
        const app = mount(`
            <div ys-data="{ show: true, name: 'Aisha' }">
                <p ys-if="show" ys-text="name"></p>
            </div>
        `)

        YS.compile(app.container)
        await nextTick()

        expect(app.text('p')).toBe('Aisha')

        app.destroy()
    })
})
