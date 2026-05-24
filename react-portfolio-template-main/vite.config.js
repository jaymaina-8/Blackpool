import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// Default `/` matches root domains (e.g. Vercel). For GitHub Pages under a subpath, build with:
//   VITE_APP_BASE=/YourRepoName/ npm run build
export default defineConfig({
    base: process.env.VITE_APP_BASE || '/',
    plugins: [react()],
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        // Split the swiper plugin library into a separate chunk to avoid a large chunk size on index.js
                        if (id.includes('swiper'))
                            return 'swiper';
                        return;
                    }
                }
            }
        }
    },
    css: {
        preprocessorOptions: {
            scss: {
                silenceDeprecations: ["mixed-decls", "color-functions", "global-builtin", "import"],
            },
        },
    },
})
