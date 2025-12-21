import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
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
})
