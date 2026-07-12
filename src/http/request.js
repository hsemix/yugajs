import { resolveGlobalHeaders } from '../runtime/config.js'
import { getCached, setCached } from './cache.js'

export function request(url, options = {}) {
    const method = String(
        options.method || 'GET'
    ).toUpperCase()

    const headers = {
        ...resolveGlobalHeaders(),
        ...(options.headers || {})
    }

    const body = options.body ?? null
    const onProgress = options.onProgress || null

    /*
    |--------------------------------------------------------------------------
    | Cache options
    |--------------------------------------------------------------------------
    |
    | cache is expressed in seconds:
    |
    | request('/users', {
    |     cache: 30
    | })
    |
    */
    const cacheTtl = normalizeCacheTtl(
        options.cache
    )

    const cacheEnabled =
        cacheTtl > 0 &&
        isCacheableMethod(method)

    const cacheKey =
        options.cacheKey ||
        createCacheKey(
            method,
            url,
            headers
        )

    if (cacheEnabled) {
        const cached = getCached(cacheKey)

        if (cached !== null) {
            return Promise.resolve({
                ...cached,
                cached: true
            })
        }
    }

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        xhr.open(method, url, true)

        if (options.timeout) {
            xhr.timeout = Number(options.timeout)
        }

        if (options.withCredentials !== undefined) {
            xhr.withCredentials =
                Boolean(options.withCredentials)
        }

        Object.entries(headers).forEach(
            ([key, value]) => {
                if (
                    value === undefined ||
                    value === null
                ) {
                    return
                }

                xhr.setRequestHeader(
                    key,
                    String(value)
                )
            }
        )

        if (xhr.upload && onProgress) {
            xhr.upload.onprogress = event => {
                if (!event.lengthComputable) {
                    return
                }

                const percent = Math.round(
                    (event.loaded / event.total) * 100
                )

                onProgress(percent, event)
            }
        }

        xhr.onload = () => {
            const result = createResponse(xhr)

            /*
            |--------------------------------------------------------------------------
            | Only cache successful responses
            |--------------------------------------------------------------------------
            */
            if (
                cacheEnabled &&
                result.ok
            ) {
                setCached(
                    cacheKey,
                    result,
                    cacheTtl
                )
            }

            resolve({
                ...result,
                cached: false
            })
        }

        xhr.onerror = () => {
            reject(
                new Error(
                    `[YS] Network request failed: ${method} ${url}`
                )
            )
        }

        xhr.ontimeout = () => {
            reject(
                new Error(
                    `[YS] Request timed out: ${method} ${url}`
                )
            )
        }

        xhr.onabort = () => {
            reject(
                new Error(
                    `[YS] Request was aborted: ${method} ${url}`
                )
            )
        }

        xhr.send(body)
    })
}

function createResponse(xhr) {
    const contentType =
        xhr.getResponseHeader('Content-Type') ||
        ''

    let data = xhr.responseText
    let type = 'html'

    if (
        contentType.includes('application/json') ||
        contentType.includes('+json')
    ) {
        type = 'json'

        try {
            data = xhr.responseText
                ? JSON.parse(xhr.responseText)
                : {}
        } catch (error) {
            console.error(
                '[YS] Failed to parse JSON response:',
                error
            )

            data = {
                parseError: true,
                raw: xhr.responseText
            }
        }
    }

    return {
        ok:
            xhr.status >= 200 &&
            xhr.status < 300,

        status: xhr.status,
        statusText: xhr.statusText,

        type,
        data,

        headers: {
            redirect:
                xhr.getResponseHeader(
                    'X-YS-Redirect'
                ),

            contentType,

            location:
                xhr.getResponseHeader(
                    'Location'
                )
        }
    }
}

function normalizeCacheTtl(value) {
    const ttl = Number(value || 0)

    return Number.isFinite(ttl) && ttl > 0
        ? ttl
        : 0
}

function isCacheableMethod(method) {
    return (
        method === 'GET' ||
        method === 'HEAD'
    )
}

function createCacheKey(
    method,
    url,
    headers
) {
    const normalizedHeaders =
        Object.entries(headers)
            .filter(([, value]) =>
                value !== undefined &&
                value !== null
            )
            .sort(([left], [right]) =>
                left.localeCompare(right)
            )
            .map(([key, value]) =>
                `${key.toLowerCase()}:${String(value)}`
            )
            .join('|')

    return [
        'request',
        method,
        url,
        normalizedHeaders
    ].join(':')
}