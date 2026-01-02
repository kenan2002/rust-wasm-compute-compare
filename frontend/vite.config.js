import { defineConfig } from 'vite';

export default defineConfig({
  // Base path for GitHub Pages (repo name)
  base: process.env.GITHUB_ACTIONS ? '/rust-wasm-compute-compare/' : '/',
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
  },
  optimizeDeps: {
    exclude: ['rust-compute'],
  },
});

