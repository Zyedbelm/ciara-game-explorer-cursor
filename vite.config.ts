import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Optimisations de build
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Séparer les dépendances lourdes
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
          animations: ['framer-motion'],
          maps: ['@googlemaps/js-api-loader'],
          charts: ['d3', 'recharts'],
        },
      },
    },
    // Optimiser la taille des chunks
    chunkSizeWarningLimit: 1000,
  },
  // Optimisations de développement
  server: {
    port: 8080,
    host: true,
    // Optimiser le hot reload
    hmr: {
      overlay: false,
    },
  },
  // Optimisations de préchargement
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      'framer-motion',
      'lucide-react',
      'class-variance-authority',
      'clsx',
      'tailwind-merge',
    ],
    exclude: [
      // Exclure les dépendances qui causent des problèmes
    ],
  },
  // Configuration CSS
  css: {
    devSourcemap: true,
  },
  // Configuration des assets
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg', '**/*.webp'],
  // Configuration de la compression
  preview: {
    port: 4173,
    host: true,
  },
  // Configuration des métriques
  define: {
    __DEV__: process.env.NODE_ENV === 'development',
  },
})
