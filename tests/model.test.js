import { describe, it, expect } from 'vitest'
import YS from '../src/ys.js'
import {
    mount,
    input,
    nextTick
} from '../src/testing/index.js'

describe('model', () => {
    it('updates text when input changes', async () => {
        const app = mount(`
            <div ys-data="{ name: '' }">
                <input ys-model="name">
                <span ys-text="name"></span>
            </div>
        `)

        YS.compile(app.container)

        input(app.el('input'), 'Hamid')

        await nextTick()

        expect(app.text('span')).toBe('Hamid')

        app.destroy()
    })
})