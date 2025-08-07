import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Configuration pour GitHub Pages
  base: '/',
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Optimisations de build avancées
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 2,
      },
      mangle: {
        toplevel: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Séparer les dépendances lourdes
          vendor: ['react', 'react-dom'],
          ui: [
            '@radix-ui/react-dialog', 
            '@radix-ui/react-dropdown-menu', 
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast'
          ],
          animations: ['framer-motion'],
          maps: ['@googlemaps/js-api-loader'],
          charts: ['d3', 'recharts'],
          supabase: ['@supabase/supabase-js'],
          forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
        },
        // Optimiser les noms de fichiers
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
      // Exclure les dépendances de développement
      external: process.env.NODE_ENV === 'production' ? [] : [],
    },
    // Optimiser la taille des chunks
    chunkSizeWarningLimit: 1000,
    // Optimisations de source maps
    sourcemap: process.env.NODE_ENV === 'development',
    // Optimisations de CSS
    cssCodeSplit: true,
    // Optimisations de polyfills
    polyfillModulePreload: true,
  },
  // Optimisations de développement
  server: {
    port: 8080,
    host: true,
    // Optimiser le hot reload
    hmr: {
      overlay: false,
    },
    // Headers de sécurité pour le développement
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
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
      'date-fns',
      'zod',
    ],
    exclude: [
      // Exclure les dépendances qui causent des problèmes
    ],
    // Optimisations de force
    force: process.env.NODE_ENV === 'development',
  },
  // Configuration CSS optimisée
  css: {
    devSourcemap: process.env.NODE_ENV === 'development',
    postcss: './postcss.config.js',
  },
  // Configuration des assets optimisée
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg', '**/*.webp', '**/*.avif'],
  // Configuration de la compression
  preview: {
    port: 4173,
    host: true,
    // Headers de sécurité pour la preview
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  },
  // Configuration des métriques et variables globales
  define: {
    __DEV__: process.env.NODE_ENV === 'development',
    __PROD__: process.env.NODE_ENV === 'production',
    // Variables d'environnement sécurisées
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  },
  // Configuration de sécurité
  esbuild: {
    // Supprimer les console.log en production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    // Optimisations de parsing
    target: 'esnext',
  },
  // Configuration des tests
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
