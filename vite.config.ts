/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config https://vitest.dev/config
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    VitePWA({
      registerType: 'prompt',
      manifest: false,
      workbox: {
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,ttf,webmanifest}'],
        runtimeCaching: [
          {
            urlPattern: /\/locales\/.*/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'i18n-locales',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 }
            }
          },
          {
            urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cdn-resources',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 30 }
            }
          }
        ]
      }
    })
  ],
  define: {
    'process.env': {}
  },
  optimizeDeps: {
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util']
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: '.vitest/setup',
    include: ['**/*.test.{ts,tsx}']
  },
  worker: { format: 'es' }
});
