import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Use relative paths so the app works when served from a subdirectory (e.g. GitHub Pages)
  base: './',
})
