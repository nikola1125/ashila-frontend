import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import legacy from '@vitejs/plugin-legacy'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [
      react(), 
      tailwindcss(),
      legacy({
        targets: ['> 0.5%', 'last 2 versions', 'Firefox ESR', 'not dead'],
        additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
        renderLegacyChunks: true,
        polyfills: [
          'es.object.assign',
          'es.object.values',
          'es.object.entries',
          'es.object.keys',
          'es.array.find',
          'es.array.find-index',
          'es.array.includes',
          'es.array.from',
          'es.array.of',
          'es.string.includes',
          'es.string.starts-with',
          'es.string.ends-with',
          'es.promise',
          'es.promise.finally',
          'es.map',
          'es.set',
          'es.symbol',
          'es.symbol.async-iterator'
        ]
      })
    ],
    define: {
      // Ensure NODE_ENV is set correctly
      __APP_ENV__: JSON.stringify(env.NODE_ENV || mode),
      // Polyfill for legacy browsers
      global: 'globalThis',
    },
    build: {
      target: ['es2015', 'chrome70', 'firefox65', 'safari12', 'edge79'],
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('firebase')) {
                return 'firebase';
              }
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
                return 'react-vendor';
              }
              if (
                id.includes('framer-motion') ||
                id.includes('motion') ||
                id.includes('lucide-react') ||
                id.includes('react-icons') ||
                id.includes('sweetalert2') ||
                id.includes('swiper') ||
                id.includes('slick-carousel') ||
                id.includes('@headlessui') ||
                id.includes('react-toastify')
              ) {
                return 'ui-libs';
              }
              if (
                id.includes('jspdf') ||
                id.includes('html2canvas') ||
                id.includes('xlsx') ||
                id.includes('file-saver') ||
                id.includes('@react-pdf')
              ) {
                return 'utils-heavy';
              }
              if (id.includes('@tanstack') || id.includes('axios')) {
                return 'data-libs';
              }
            }
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },
    server: {
      host: true,
      port: 5173,
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
    },
  }
})
