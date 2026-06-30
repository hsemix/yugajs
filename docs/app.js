const sidebar = document.querySelector('.sidebar')
const toggle = document.querySelector('[data-menu-toggle]')
const navLinks = [...document.querySelectorAll('.nav a')]
const sections = navLinks
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean)
const search = document.querySelector('[data-search]')
const searchable = [...document.querySelectorAll('[data-search-item]')]

toggle?.addEventListener('click', () => {
    sidebar?.classList.toggle('open')
})

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        sidebar?.classList.remove('open')
    })
})

const observer = new IntersectionObserver(entries => {
    const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

    if (!visible) return

    navLinks.forEach(link => {
        link.classList.toggle(
            'active',
            link.getAttribute('href') === `#${visible.target.id}`
        )
    })
}, {
    rootMargin: '-20% 0px -65% 0px',
    threshold: [0.1, 0.25, 0.5]
})

sections.forEach(section => observer.observe(section))

document.querySelectorAll('pre code').forEach(code => {
    const wrapper = document.createElement('div')
    wrapper.className = 'code-block'

    const pre = code.parentElement
    pre.parentElement.insertBefore(wrapper, pre)
    wrapper.appendChild(pre)

    const button = document.createElement('button')
    button.className = 'copy'
    button.type = 'button'
    button.textContent = 'Copy'
    button.addEventListener('click', async () => {
        await navigator.clipboard.writeText(code.textContent)
        button.textContent = 'Done'
        window.setTimeout(() => {
            button.textContent = 'Copy'
        }, 1200)
    })

    wrapper.appendChild(button)
})

search?.addEventListener('input', () => {
    const term = search.value.trim().toLowerCase()

    searchable.forEach(item => {
        item.classList.toggle(
            'hidden',
            term.length > 0 && !item.textContent.toLowerCase().includes(term)
        )
    })
})

