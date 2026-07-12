import { directive } from '../compiler/directives.js'

directive('preview', {
    priority: 0,

    handler(el, { expression }) {
        if (el.type !== 'file') {
            console.warn('[YS] ys-preview only works on file inputs')
            return
        }

        const target = document.querySelector(expression)

        if (!target) {
            console.warn('[YS] ys-preview target not found:', expression)
            return
        }

        el.addEventListener('change', () => {
            target.innerHTML = ''

            const files = Array.from(el.files || [])

            files.forEach(file => {
                if (file.type.startsWith('image/')) {
                    const img = document.createElement('img')

                    img.src = URL.createObjectURL(file)
                    img.style.maxWidth = '160px'
                    img.style.marginRight = '10px'
                    img.style.marginTop = '10px'

                    img.onload = () => {
                        URL.revokeObjectURL(img.src)
                    }

                    target.appendChild(img)
                    return
                }

                const item = document.createElement('div')
                item.textContent = file.name

                target.appendChild(item)
            })
        })
    }
})