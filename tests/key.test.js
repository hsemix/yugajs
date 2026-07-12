import { describe, it, expect } from 'vitest'
import YS from '../src/ys.js'
import { mount, nextTick } from '../src/testing/index.js'

function keydown(target, options) {
    target.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, ...options }))
}

describe('ys-key', () => {

    it('runs the expression when the given key is pressed', async () => {
        const app = mount(`
            <div ys-data="{ submitted: false }">
                <p ys-key:enter="submitted = true"></p>
            </div>
        `)

        YS.compile(app.container)
        await nextTick()

        const scope = app.el('[ys-data]').__ysScope

        keydown(document, { key: 'a' })
        await nextTick()
        expect(scope.submitted).toBe(false)

        keydown(document, { key: 'Enter' })
        await nextTick()
        expect(scope.submitted).toBe(true)

        app.destroy()
    })

    it('requires the modifier keys in the combo to match', async () => {
        const app = mount(`
            <div ys-data="{ saved: false }">
                <p ys-key:ctrl+s="saved = true"></p>
            </div>
        `)

        YS.compile(app.container)
        await nextTick()

        const scope = app.el('[ys-data]').__ysScope

        keydown(document, { key: 's', ctrlKey: false })
        await nextTick()
        expect(scope.saved).toBe(false)

        keydown(document, { key: 's', ctrlKey: true })
        await nextTick()
        expect(scope.saved).toBe(true)

        app.destroy()
    })
})
