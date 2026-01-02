import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Base path for GitHub Pages (repo name)
  base: process.env.GITHUB_ACTIONS ? '/rust-wasm-compute-compare/' : '/',
  server: {
    port: 3000,
    fs: {
      // Allow serving files from js-compute directory
      allow: ['..'],
    },
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
  resolve: {
    alias: {
      '@js-compute': resolve(__dirname, '../js-compute'),
    },
  },
  optimizeDeps: {
    exclude: ['rust-compute'],
  },
});

