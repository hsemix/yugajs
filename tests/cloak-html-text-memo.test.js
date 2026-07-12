import { describe, it, expect } from 'vitest'
import YS from '../src/ys.js'
import { mount, click, nextTick } from '../src/testing/index.js'

describe('ys-cloak', () => {

    it('removes the ys-cloak attribute once compiled', async () => {
        const app = mount(`
            <div ys-data="{}">
                <p ys-cloak>hi</p>
            </div>
        `)

        expect(app.el('p').hasAttribute('ys-cloak')).toBe(true)

        YS.compile(app.container)
        await nextTick()

        expect(app.el('p').hasAttribute('ys-cloak')).toBe(false)

        app.destroy()
    })
})

describe('ys-html', () => {

    it('renders the expression result as innerHTML', async () => {
        const app = mount(`
            <div ys-data="{ markup: '<b>bold</b>' }">
                <p ys-html="markup"></p>
            </div>
        `)

        YS.compile(app.container)
        await nextTick()

        expect(app.el('p').innerHTML).toBe('<b>bold</b>')
        expect(app.el('p b')).not.toBeNull()

        app.destroy()
    })

    it('updates reactively', async () => {
        const app = mount(`
            <div ys-data="{ markup: '<i>a</i>' }">
                <button @click="markup = '<i>b</i>'">go</button>
                <p ys-html="markup"></p>
            </div>
        `)

        YS.compile(app.container)
        await nextTick()

        click(app.el('button'))
        await nextTick()

        expect(app.el('p').innerHTML).toBe('<i>b</i>')

        app.destroy()
    })
})

describe('ys-text', () => {

    it('sets textContent from the expression', async () => {
        const app = mount(`
            <div ys-data="{ name: 'Aisha' }">
                <p ys-text="name"></p>
            </div>
        `)

        YS.compile(app.container)
        await nextTick()

        expect(app.text('p')).toBe('Aisha')

        app.destroy()
    })

    it('does not interpret the value as HTML', async () => {
        const app = mount(`
            <div ys-data="{ raw: '<b>x</b>' }">
                <p ys-text="raw"></p>
            </div>
        `)

        YS.compile(app.container)
        await nextTick()

        expect(app.el('p b')).toBeNull()
        expect(app.text('p')).toBe('<b>x</b>')

        app.destroy()
    })
})

describe('ys-memo', () => {

    it('records the evaluated expression as the memo value on mount', async () => {
        const app = mount(`
            <div ys-data="{ tick: 5 }">
                <div ys-memo="tick"></div>
            </div>
        `)

        YS.compile(app.container)
        await nextTick()

        expect(app.el('div[ys-memo]').__ysMemo).toMatchObject({
            expression: 'tick',
            value: 5
        })

        app.destroy()
    })
})
