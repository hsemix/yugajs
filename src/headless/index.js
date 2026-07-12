export const YugaHeadless = {
    name: 'yuga-headless',

    install(YS) {
        YS.component('headless-tabs', {
            data() {
                return {
                    value: null
                }
            },

            methods: {
                select(value) {
                    this.value = value
                },

                isSelected(value) {
                    return this.value === value
                }
            },

            init() {
                if (this.value === null) {
                    this.value = this.props?.defaultValue ?? null
                }
            }
        })

        YS.component('headless-disclosure', {
            data() {
                return {
                    open: this.props?.defaultOpen || false
                }
            },

            methods: {
                toggle() {
                    this.open = !this.open
                },

                close() {
                    this.open = false
                },

                show() {
                    this.open = true
                }
            }
        })

        YS.component('headless-dialog', {
            data() {
                return {
                    open: false
                }
            },

            methods: {
                show() {
                    this.open = true
                },

                close() {
                    this.open = false
                },

                toggle() {
                    this.open = !this.open
                }
            },

            init() {
                this.open = this.props?.defaultOpen || false
            }
        })

        YS.component('headless-dropdown', {
            data() {
                return {
                    open: false
                }
            },

            methods: {
                toggle() {
                    this.open = !this.open
                },

                close() {
                    this.open = false
                },

                show() {
                    this.open = true
                }
            }
        })

        YS.component('headless-toggle', {
            data() {
                return {
                    pressed: false
                }
            },

            methods: {
                toggle() {
                    this.pressed = !this.pressed
                }
            },

            init() {
                this.pressed = this.props?.defaultPressed || false
            }
        });

        YS.component('headless-popover', {
            data() {
                return {
                    open: false
                }
            },

            methods: {
                toggle() {
                    this.open = !this.open
                },

                show() {
                    this.open = true
                },

                close() {
                    this.open = false
                }
            }
        })

        YS.component('headless-menu', {
            data() {
                return {
                    open: false,
                    activeIndex: 0
                }
            },

            methods: {
                toggle() {
                    this.open = !this.open
                },

                show() {
                    this.open = true
                },

                close() {
                    this.open = false
                },

                next(itemsLength) {
                    this.activeIndex =
                        (this.activeIndex + 1) % itemsLength
                },

                prev(itemsLength) {
                    this.activeIndex =
                        (this.activeIndex - 1 + itemsLength) % itemsLength
                }
            }
        })

        YS.component('headless-combobox', {
            data() {
                return {
                    open: false,
                    query: '',
                    selected: null,
                    activeIndex: 0
                }
            },

            methods: {
                show() {
                    this.open = true
                },

                close() {
                    this.open = false
                },

                select(item) {
                    this.selected = item
                    this.close()
                }
            }
        })

        YS.component('headless-listbox', {
            data() {
                return {
                    open: false,
                    value: null
                }
            },

            methods: {
                select(value) {
                    this.value = value
                    this.open = false
                },

                toggle() {
                    this.open = !this.open
                }
            },

            init() {
                this.value = this.props?.defaultValue ?? null
            }
        })

        YS.component('headless-radio-group', {
            data() {
                return {
                    value: null
                }
            },

            methods: {
                select(value) {
                    this.value = value
                },

                isSelected(value) {
                    return this.value === value
                }
            },

            init() {
                this.value = this.props?.defaultValue ?? null
            }
        })

        YS.component('headless-checkbox-group', {
            data() {
                return {
                    values: []
                }
            },

            methods: {
                toggle(value) {
                    if (this.values.includes(value)) {
                        this.values =
                            this.values.filter(v => v !== value)
                    } else {
                        this.values = [...this.values, value]
                    }
                },

                has(value) {
                    return this.values.includes(value)
                }
            }
        })

        YS.component('headless-tooltip', {
            data() {
                return {
                    open: false
                }
            },

            methods: {
                show() {
                    this.open = true
                },

                close() {
                    this.open = false
                }
            }
        })

        YS.component('headless-command', {
            data() {
                return {
                    open: false,
                    query: '',
                    activeIndex: 0
                }
            },

            methods: {
                show() {
                    this.open = true
                },

                close() {
                    this.open = false
                }
            }
        })
    }
}