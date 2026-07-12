import { describe, it, expect } from 'vitest'
import YS from '../src/ys.js'
import {
    mount,
    click,
    nextTick
} from '../src/testing/index.js'

describe('counter', () => {

    it('increments count', async () => {

        const app = mount(`
            <div ys-data="{ count: 0 }">
                <button @click="count++">+</button>
                <span ys-text="count"></span>
            </div>
        `)

        YS.compile(app.container)

        expect(app.text('span')).toBe('0')

        click(app.el('button'))

        await nextTick()

        expect(app.text('span')).toBe('1')

        app.destroy()
    })
})