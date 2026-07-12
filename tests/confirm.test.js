import { describe, it, expect, vi, afterEach } from 'vitest'
import YS from '../src/ys.js'
import { mount, click, nextTick } from '../src/testing/index.js'

afterEach(() => {
    vi.unstubAllGlobals()
})

describe('ys-confirm', () => {

    it('blocks the click when the user declines the confirmation', async () => {
        vi.stubGlobal('confirm', vi.fn(() => false))

        const app = mount(`
            <div ys-data="{ clicked: false }">
                <button ys-confirm="Are you sure?" @click="clicked = true">go</button>
            </div>
        `)

        YS.compile(app.container)
        await nextTick()

        click(app.el('button'))
        await nextTick()

        expect(globalThis.confirm).toHaveBeenCalledWith('Are you sure?')
        expect(app.el('[ys-data]').__ysScope.clicked).toBe(false)

        app.destroy()
    })

    it('lets the click through when the user accepts the confirmation', async () => {
        vi.stubGlobal('confirm', vi.fn(() => true))

        const app = mount(`
            <div ys-data="{ clicked: false }">
                <button ys-confirm="Are you sure?" @click="clicked = true">go</button>
            </div>
        `)

        YS.compile(app.container)
        await nextTick()

        click(app.el('button'))
        await nextTick()

        expect(app.el('[ys-data]').__ysScope.clicked).toBe(true)

        app.destroy()
    })
})
