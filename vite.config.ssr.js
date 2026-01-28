import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// SSR-optimized configuration for YMYL compliance
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [
      react({
        // Enable Fast Refresh for development
        fastRefresh: true,
        // Configure for SSR
        jsxImportSource: '@emotion/react',
      }),
      tailwindcss()
    ],
    
    // Build optimizations for SSR
    build: {
      target: 'esnext',
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production',
        },
      },
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
      // Generate source maps for debugging
      sourcemap: mode === 'development',
    },
    
    // Server configuration for SSR
    server: {
      host: true,
      port: 5173,
      // Proxy API requests to backend
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        },
        '/seo': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        }
      }
    },
    
    // Preview configuration for production testing
    preview: {
      port: 4173,
      host: true,
    },
    
    // Define global constants
    define: {
      __APP_ENV__: JSON.stringify(env.NODE_ENV || mode),
      __IS_SSR__: 'true',
      __YMYL_COMPLIANT__: 'true',
    },
    
    // CSS configuration
    css: {
      devSourcemap: mode === 'development',
      postcss: {
        plugins: [
          // Add any PostCSS plugins for optimization
        ]
      }
    },
    
    // Dependencies optimization
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'axios',
        '@tanstack/react-query'
      ],
      exclude: [
        // Exclude heavy dependencies from pre-bundling
        'jspdf',
        'html2canvas'
      ]
    },
    
    // Experimental features for better performance
    experimental: {
      renderBuiltUrl(filename, { hostType }) {
        if (hostType === 'js') {
          return { js: `/${filename}` }
        } else {
          return { relative: true }
        }
      }
    }
  }
})
