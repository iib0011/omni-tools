/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import { resolve } from 'path';

// https://vitejs.dev/config https://vitest.dev/config
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      components: resolve(__dirname, 'src/components'),
      providers: resolve(__dirname, 'src/providers'),
      pages: resolve(__dirname, 'src/pages'),
      tools: resolve(__dirname, 'src/tools'),
      utils: resolve(__dirname, 'src/utils'),
      config: resolve(__dirname, 'src/config'),
      contexts: resolve(__dirname, 'src/contexts'),
      i18n: resolve(__dirname, 'src/i18n'),
      assets: resolve(__dirname, 'src/assets')
    }
  },
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
