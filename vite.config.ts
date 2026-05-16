/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config https://vitest.dev/config
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    {
      name: 'markdown-pdf-api',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          const { handleMarkdownPdfRequest } = await server.ssrLoadModule(
            '/server/markdown-to-pdf/http.ts'
          );

          if (await handleMarkdownPdfRequest(req, res)) {
            return;
          }

          next();
        });
      }
    }
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
