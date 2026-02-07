/// <reference types='vitest' />
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
import { viteDevLogPlugin } from '../../vite-dev-log-plugin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname);

export default defineConfig(() => ({
  root: projectRoot,
  publicDir: path.join(projectRoot, 'public'),
  cacheDir: '../../node_modules/.vite/apps/core-web-app',
  server: {
    port: 4200,
    host: 'localhost',
    fs: {
      allow: [path.resolve(__dirname), path.resolve(__dirname, '../..')],
    },
  },
  preview: {
    port: 4200,
    host: 'localhost',
  },
  plugins: [react(), nxViteTsPaths(), nxCopyAssetsPlugin(['*.md']), viteDevLogPlugin()],
  // Uncomment this if you are using workers.
  // worker: {
  //   plugins: () => [ nxViteTsPaths() ],
  // },
  build: {
    outDir: '../../dist/apps/core-web-app',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [path.resolve(__dirname, '../..', 'vitest.setup.ts')],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
}));
