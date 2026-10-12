import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      '@': process.cwd()
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
