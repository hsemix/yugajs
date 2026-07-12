import { describe, it, expect } from 'vitest'
import YS from '../src/ys.js'
import { mount, click, nextTick } from '../src/testing/index.js'

describe('ys-bind (:attr)', () => {

    it('sets the attribute to the evaluated value', async () => {
        const app = mount(`
            <div ys-data="{ url: '/home' }">
                <a :href="url">link</a>
            </div>
        `)

        YS.compile(app.container)
        await nextTick()

        expect(app.el('a').getAttribute('href')).toBe('/home')

        app.destroy()
    })

    it('renders a boolean-true value as a valueless attribute', async () => {
        const app = mount(`
            <div ys-data="{ disabled: true }">
                <button :disabled="disabled">go</button>
            </div>
        `)

        YS.compile(app.container)
        await nextTick()

        expect(app.el('button').getAttribute('disabled')).toBe('')

        app.destroy()
    })

    it('removes the attribute for false/null/undefined values', async () => {
        const app = mount(`
            <div ys-data="{ disabled: true }">
                <button :disabled="disabled" @click="disabled = false">go</button>
            </div>
        `)

        YS.compile(app.container)
        await nextTick()

        expect(app.el('button').hasAttribute('disabled')).toBe(true)

        click(app.el('button'))
        await nextTick()

        expect(app.el('button').hasAttribute('disabled')).toBe(false)

        app.destroy()
    })

    it('updates the attribute reactively', async () => {
        const app = mount(`
            <div ys-data="{ disabled: false }">
                <button :disabled="disabled" @click="disabled = true">go</button>
            </div>
        `)

        YS.compile(app.container)
        await nextTick()

        expect(app.el('button').hasAttribute('disabled')).toBe(false)

        click(app.el('button'))
        await nextTick()

        expect(app.el('button').hasAttribute('disabled')).toBe(true)

        app.destroy()
    })
})
