import { $ } from './core/selector.js';

import './core/events.js';
import { ready } from './core/events.js'

import './dom/index.js';

import { request } from './http/request.js';

/*
|-----------------------------------------------
| Utility Functions
|-----------------------------------------------
*/
import { create } from './core/create.js';
import { collectionPlugin } from './core/plugin.js';
import { signal, signalEffect } from './reactive/signal.js';
import { store, clearStore } from './reactive/store.js';
import { effect } from './reactive/effect.js';
import { watch } from './reactive/watch.js'
import { computed } from './reactive/computed.js'
import { morph } from './dom/morph.js';

/*
|--------------------------------------------------------------------------
| Runtime (IMPORTANT PART YOU WERE MISSING)
|--------------------------------------------------------------------------
*/
import { compile } from './compiler/compiler.js'
// import { startObserver } from './compiler/observer.js'
import { observe } from './compiler/observer.js'

import './directives/index.js'
import { directive } from './compiler/directives.js'

import { on } from './runtime/events.js'

import { nextTick } from './runtime/scheduler.js'
import { component } from './runtime/components.js'
import { clearCache } from './http/cache.js'

import { use, installed } from './runtime/plugins.js'
import { configure } from './runtime/config.js'
import { YugaHeadless } from './headless/index.js'

$.morph = morph
$.get = (url) => {
    return request(url, {
        method: 'GET'
    });
}

$.post = (url, data) => {
    return request(url, {
        method: 'POST',
        data
    });
}

$.put = (url, data) => {
    return request(url, {
        method: 'PUT',
        data
    });
}

$.delete = (url) => {
    return request(url, {
        method: 'DELETE'
    });
}

// $.debounce
$.debounce = function (func, delay) {
    let timeoutId;

    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

// $.throttle()
$.throttle = function (func, limit) {
    let lastFunc;
    let lastRan;

    return function (...args) {
        if (!lastRan) {
            func.apply(this, args);
            lastRan = Date.now();
        } else {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(() => {
                if ((Date.now() - lastRan) >= limit) {
                    func.apply(this, args);
                    lastRan = Date.now();
                }
            }, limit - (Date.now() - lastRan));
        }
    };
}

// $.uuid()
$.uuid = function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

$.parseHTML = function (html) {

    const template = document.createElement('template')

    template.innerHTML = html.trim()

    return template.content
}

$.ready = ready

/*
|--------------------------------------------------------------------------
| Boot runtime AFTER DOM is ready
|--------------------------------------------------------------------------
*/
// $.ready(() => {
//     compile(document);
//     startObserver();
// })


$.on = on
$.compile = compile
$.nextTick = nextTick
$.component = component
$.watch = watch

$.computed = computed
$.request = request
$.create = create
$.fn = collectionPlugin

$.signal = signal
$.signalEffect = signalEffect
$.store = store
$.clearStore = clearStore
$.effect = effect

$.directive = directive
$.observe = observe
$.clearCache = clearCache

$.use = function (plugin, options = {}) {
    return use($, plugin, options)
}

$.plugins = installed

$.plugin = function (callback, options = {}) {
    return $.use(callback, options)
}

$.scope = function (selectorOrElement) {
    const el = typeof selectorOrElement === 'string'
        ? document.querySelector(selectorOrElement)
        : selectorOrElement

    return el?.__ysScope
}

$.redirect = function (url, replace = false) {
    if (replace) {
        window.location.replace(url)
        return
    }

    window.location.href = url
}

$.config = configure
$.headless = YugaHeadless

$.data = function (selectorOrElement, state = {}) {
    const el = typeof selectorOrElement === 'string'
        ? document.querySelector(selectorOrElement)
        : selectorOrElement

    if (!el) return null

    el.__ysData = state

    if (!el.hasAttribute('ys-data')) {
        el.setAttribute('ys-data', '')
    }

    compile(el)

    return el.__ysScope
}

$.start = function () {
    $.ready(() => {
        compile(document)
        observe(document.body)
    })

    return $
}

globalThis.$ = globalThis.$ || $
globalThis.YS = $

export default $