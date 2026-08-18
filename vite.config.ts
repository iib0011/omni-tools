/// <reference types="vitest" />
import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import packageJson from './package.json';
import { execSync } from 'node:child_process';

const commitHash = execSync('git rev-parse --short HEAD').toString().trim();

const runtimeBaseUrlPlugin: Plugin = {
  name: 'runtime-base-url',
  transformIndexHtml(html, context) {
    return html.replace(
      '__OMNI_TOOLS_BASE_URL__',
      context.server ? '/' : '$BASE_URL'
    );
  }
};

// https://vitejs.dev/config https://vitest.dev/config
export default defineConfig({
  base: './',
  plugins: [runtimeBaseUrlPlugin, react(), tsconfigPaths()],
  define: {
    'process.env': {},
    __APP_VERSION__: JSON.stringify(packageJson.version),
    __COMMIT_HASH__: JSON.stringify(commitHash)
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
