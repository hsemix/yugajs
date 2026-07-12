export function markManagedAttr(el, name) {
    if (!el.__ysManagedAttrs) {
        el.__ysManagedAttrs = new Set()
    }

    el.__ysManagedAttrs.add(name)
}
