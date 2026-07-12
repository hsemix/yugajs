import { describe, it, expect } from 'vitest'
import YS from '../src/ys.js'
import { mount, click, nextTick } from '../src/testing/index.js'

describe('ys-show', () => {

    it('sets display:none when the expression is falsy on first render', async () => {
        const app = mount(`
            <div ys-data="{ visible: false }">
                <p ys-show="visible">hi</p>
            </div>
        `)

        YS.compile(app.container)
        await nextTick()

        expect(app.el('p').style.display).toBe('none')

        app.destroy()
    })

    it('leaves display alone when the expression is truthy on first render', async () => {
        const app = mount(`
            <div ys-data="{ visible: true }">
                <p ys-show="visible">hi</p>
            </div>
        `)

        YS.compile(app.container)
        await nextTick()

        expect(app.el('p').style.display).toBe('')

        app.destroy()
    })

    it('toggles display as the expression changes', async () => {
        const app = mount(`
            <div ys-data="{ visible: true }">
                <button @click="visible = !visible">toggle</button>
                <p ys-show="visible">hi</p>
            </div>
        `)

        YS.compile(app.container)
        await nextTick()

        click(app.el('button'))
        await nextTick()
        expect(app.el('p').style.display).toBe('none')

        click(app.el('button'))
        await nextTick()
        expect(app.el('p').style.display).toBe('')

        app.destroy()
    })
})
