import { describe, it, expect } from 'vitest'
import YS from '../src/ys.js'
import { mount, click, nextTick } from '../src/testing/index.js'

describe('ys-teleport', () => {

    it('moves the element to the target, keeping directives on its children working', async () => {
        const app = mount(`
            <div>
                <div id="target"></div>
                <div ys-data="{ name: 'Aisha', open: true }">
                    <div ys-teleport="#target">
                        <p ys-show="open" ys-text="name">stay</p>
                    </div>
                </div>
            </div>
        `)

        YS.compile(app.container)
        await nextTick()

        const target = app.el('#target')

        expect(target.querySelector('p')).not.toBeNull()
        expect(target.querySelector('p').textContent).toBe('Aisha')
        expect(target.querySelector('p').style.display).toBe('')

        const scope = app.el('[ys-data]').__ysScope
        scope.open = false
        await nextTick()

        expect(target.querySelector('p').style.display).toBe('none')

        app.destroy()
    })

    it('still runs directives declared directly on the teleported element itself', async () => {
        const app = mount(`
            <div>
                <div id="target"></div>
                <div ys-data="{ name: 'Aisha' }">
                    <p ys-teleport="#target" ys-text="name">stay</p>
                </div>
            </div>
        `)

        YS.compile(app.container)
        await nextTick()

        expect(app.el('#target p').textContent).toBe('Aisha')

        app.destroy()
    })

    it('warns and leaves the element in place when the target does not exist', async () => {
        const app = mount(`
            <div ys-data="{}">
                <div ys-teleport="#missing">content</div>
            </div>
        `)

        const warn = console.warn
        console.warn = () => {}

        YS.compile(app.container)
        await nextTick()

        console.warn = warn

        expect(app.el('[ys-teleport]')).not.toBeNull()

        app.destroy()
    })
})

describe('ys-slot', () => {

    it('captures the component root\'s original markup into scope.$slot on init', async () => {
        const app = mount(`
            <div ys-data="{}">
                <p>original content</p>
            </div>
        `)

        YS.compile(app.container)
        await nextTick()

        const scope = app.el('[ys-data]').__ysScope
        expect(scope.$slot.trim()).toBe('<p>original content</p>')

        app.destroy()
    })

    it('renders $slot content into the placeholder without recursing', async () => {
        // scope.$slot is captured from this component root's own innerHTML,
        // which includes the ys-slot placeholder itself. The directive strips
        // ys-slot off the *injected copy* so it renders as inert markup
        // instead of re-triggering itself - this used to recurse infinitely.
        const app = mount(`
            <div ys-data="{}">
                <p>before</p>
                <div ys-slot></div>
            </div>
        `)

        YS.compile(app.container)
        await nextTick()

        // Only the original placeholder still carries ys-slot - the copy of
        // itself that got rendered into $slot's markup does not.
        expect(app.container.querySelectorAll('[ys-slot]').length).toBe(1)

        const slotEl = app.el('[ys-slot]')
        expect(slotEl.querySelector('p').textContent).toBe('before')

        app.destroy()
    })

    it('compiles directives inside the slotted content against the component scope', async () => {
        const app = mount(`
            <div ys-data="{ name: 'Aisha' }">
                <p ys-text="name"></p>
                <div ys-slot></div>
            </div>
        `)

        YS.compile(app.container)
        await nextTick()

        // The slotted copy's <p ys-text="name"> should also render correctly.
        expect(app.all('p').every(p => p.textContent === 'Aisha')).toBe(true)

        app.destroy()
    })
})
