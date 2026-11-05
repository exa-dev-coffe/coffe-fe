import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            '@': '/src',
        },
    },

    server: {
        proxy: {
            '/api/v1/ingredients': { target: 'http://localhost:8086', changeOrigin: true },
            '/api/v1/recipes': { target: 'http://localhost:8086', changeOrigin: true },
            '/api/v1/stock': { target: 'http://localhost:8086', changeOrigin: true },
            '/api/v1/opnames': { target: 'http://localhost:8086', changeOrigin: true },
            '/api/v1/suppliers': { target: 'http://localhost:8087', changeOrigin: true },
            '/api/v1/purchases': { target: 'http://localhost:8087', changeOrigin: true },
            '/api/v1/expenses': { target: 'http://localhost:8087', changeOrigin: true },
            '/api/v1/reports': { target: 'http://localhost:8087', changeOrigin: true },
        },
    },

    build: {
        sourcemap: false,
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true,
            },
        },
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        if (id.includes('react')) return 'react'
                        if (id.includes('apexcharts')) return 'chart'
                        if (id.includes('aos')) return 'animation'
                        if (id.includes('@tanstack/react-table')) return 'table'
                        return 'vendor'
                    }
                },
            },
        },
        chunkSizeWarningLimit: 1500,
    },
})
