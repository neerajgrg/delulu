import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  base: './',
  root: 'src',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: { main: resolve(__dirname, 'src/index.html') },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5174,
    host: '0.0.0.0',
    cors: true,
    strictPort: false,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'zustand', 'marked', 'gray-matter', 'markmap-lib', 'markmap-view', 'd3', 'monaco-editor'],
    exclude: ['electron'],
  },
});
