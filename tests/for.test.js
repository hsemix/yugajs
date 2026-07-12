import { describe, it, expect } from 'vitest'
import YS from '../src/ys.js'
import { mount, click, nextTick } from '../src/testing/index.js'

describe('ys-for', () => {

    it('renders an item per array entry', async () => {
        const app = mount(`
            <div ys-data="{ items: ['a', 'b', 'c'] }">
                <ul>
                    <li ys-for="item in items" ys-text="item"></li>
                </ul>
            </div>
        `)

        YS.compile(app.container)
        await nextTick()

        expect(app.all('li').map(li => li.textContent)).toEqual(['a', 'b', 'c'])

        app.destroy()
    })

    it('exposes the index when destructuring "item, index"', async () => {
        const app = mount(`
            <div ys-data="{ items: ['a', 'b'] }">
                <li ys-for="item, index in items" ys-text="index + ':' + item"></li>
            </div>
        `)

        YS.compile(app.container)
        await nextTick()

        expect(app.all('li').map(li => li.textContent)).toEqual(['0:a', '1:b'])

        app.destroy()
    })

    it('re-renders when the source array is reassigned', async () => {
        const app = mount(`
            <div ys-data="{ items: ['a', 'b'] }">
                <button @click="items = [...items, 'c']">add</button>
                <li ys-for="item in items" ys-text="item"></li>
            </div>
        `)

        YS.compile(app.container)
        await nextTick()

        click(app.el('button'))
        await nextTick()

        expect(app.all('li').map(li => li.textContent)).toEqual(['a', 'b', 'c'])

        app.destroy()
    })

    it('reuses DOM nodes for matching keys instead of rebuilding them', async () => {
        const app = mount(`
            <div ys-data="{ items: [{ id: 1, name: 'a' }, { id: 2, name: 'b' }] }">
                <button @click="items = [items[1], items[0]]">swap</button>
                <li ys-for="item in items" ys-key="item.id" ys-text="item.name"></li>
            </div>
        `)

        YS.compile(app.container)
        await nextTick()

        const [firstNode, secondNode] = app.all('li')
        expect(app.all('li').map(li => li.textContent)).toEqual(['a', 'b'])

        click(app.el('button'))
        await nextTick()

        const reordered = app.all('li')
        expect(reordered.map(li => li.textContent)).toEqual(['b', 'a'])

        // Same underlying nodes, just moved - not recreated.
        expect(reordered[0]).toBe(secondNode)
        expect(reordered[1]).toBe(firstNode)

        app.destroy()
    })
})
