export const config = {
    debug: false,

    headers: {},

    csrf: {
        enabled: false,
        meta: 'csrf-token',
        header: 'X-CSRF-TOKEN'
    }
}

export function configure(options = {}) {
    if (!options || typeof options !== 'object') {
        return config
    }

    const {
        headers,
        csrf,
        ...rest
    } = options

    Object.assign(config, rest)

    if (headers !== undefined) {
        config.headers = headers
    }

    if (csrf !== undefined) {
        if (typeof csrf === 'boolean') {
            config.csrf.enabled = csrf
        } else if (csrf && typeof csrf === 'object') {
            config.csrf = {
                ...config.csrf,
                ...csrf,
                enabled: csrf.enabled ?? true
            }
        }
    }

    return config
}

export function getConfig() {
    return config
}

export function resolveGlobalHeaders() {
    const configuredHeaders =
        typeof config.headers === 'function'
            ? config.headers()
            : config.headers

    const headers = {
        ...(configuredHeaders || {})
    }

    if (
        config.csrf.enabled &&
        typeof document !== 'undefined'
    ) {
        const metaName = config.csrf.meta
        const meta = document.querySelector(
            `meta[name="${metaName}"]`
        )

        const token = meta?.getAttribute('content')

        if (token) {
            headers[config.csrf.header] = token
        }
    }

    return headers
}