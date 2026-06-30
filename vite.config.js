import { defineConfig } from 'vite'

// export default defineConfig({
//     build: {
//         lib: {
//             entry: 'src/ys.js',
//             name: 'YS',
//             formats: ['iife', 'es'],
//             fileName: format => {
//                 return format === 'iife'
//                     ? 'ys.min.js'
//                     : 'ys.esm.js'
//             }
//         }
//     }
// })

export default defineConfig({
    build: {
        minify: 'terser',
        lib: {
            entry: 'src/ys.js',
            name: 'YS',
            formats: ['iife', 'es'],
            fileName: format => format === 'iife'
            ? 'ys.min.js'
            : 'ys.esm.js'
        },
        rollupOptions: {
            output: {
                extend: true
            }
        },
        "sideEffects": true
    }
})