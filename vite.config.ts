import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
    ],

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
