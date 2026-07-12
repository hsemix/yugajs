import { describe, it, expect } from 'vitest'
import YS from '../src/ys.js'
import { mount, click, nextTick } from '../src/testing/index.js'

describe('ys-class', () => {

    it('applies classes from a string expression', async () => {
        const app = mount(`
            <div ys-data="{ cls: 'foo bar' }">
                <p ys-class="cls"></p>
            </div>
        `)

        YS.compile(app.container)
        await nextTick()

        expect(app.el('p').classList.contains('foo')).toBe(true)
        expect(app.el('p').classList.contains('bar')).toBe(true)

        app.destroy()
    })

    it('applies classes from an array expression', async () => {
        const app = mount(`
            <div ys-data="{ list: ['foo', null, 'bar'] }">
                <p ys-class="list"></p>
            </div>
        `)

        YS.compile(app.container)
        await nextTick()

        expect(app.el('p').className).toBe('foo bar')

        app.destroy()
    })

    it('toggles classes from an object expression as state changes', async () => {
        const app = mount(`
            <div ys-data="{ active: false }">
                <button @click="active = !active">toggle</button>
                <p ys-class="{ active: active, static: true }"></p>
            </div>
        `)

        YS.compile(app.container)
        await nextTick()

        expect(app.el('p').classList.contains('active')).toBe(false)
        expect(app.el('p').classList.contains('static')).toBe(true)

        click(app.el('button'))
        await nextTick()

        expect(app.el('p').classList.contains('active')).toBe(true)

        app.destroy()
    })
})
