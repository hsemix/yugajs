import { describe, it, expect } from 'vitest'
import YS from '../src/ys.js'
import { mount, click, nextTick } from '../src/testing/index.js'

describe('ys-init', () => {

    it('runs the expression once when the element is compiled', async () => {
        const app = mount(`
            <div ys-data="{ greeting: '' }">
                <p ys-init="greeting = 'hello'" ys-text="greeting"></p>
            </div>
        `)

        YS.compile(app.container)
        await nextTick()

        expect(app.text('p')).toBe('hello')

        app.destroy()
    })
})

describe('ys-effect', () => {

    it('re-runs the expression whenever a tracked dependency changes', async () => {
        const app = mount(`
            <div ys-data="{ count: 0, doubled: 0 }">
                <button @click="count++">+</button>
                <p ys-effect="doubled = count * 2"></p>
            </div>
        `)

        YS.compile(app.container)
        await nextTick()

        const scope = app.el('[ys-data]').__ysScope
        expect(scope.doubled).toBe(0)

        click(app.el('button'))
        await nextTick()

        expect(scope.doubled).toBe(2)

        click(app.el('button'))
        await nextTick()

        expect(scope.doubled).toBe(4)

        app.destroy()
    })
})
