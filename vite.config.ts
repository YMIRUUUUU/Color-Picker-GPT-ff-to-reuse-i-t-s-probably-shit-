import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: process.env.BASE_PATH || './',
  plugins: [react()],
  preview: {
    host: true,
    port: 4173,
    allowedHosts: 'all',
  },
});
