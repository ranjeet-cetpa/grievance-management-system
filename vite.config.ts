import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  // build: {
  //   rollupOptions: {
  //     external: ['zod'],
  //   },
  // },
  plugins: [react()],
  optimizeDeps: {
    include: ['zod'],
  },
  server: {
    port: 3001,
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
