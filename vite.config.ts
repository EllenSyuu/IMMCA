import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Relative asset paths: the same build works at a domain root (Vercel) or under /IMMCA/ (GitHub Pages).
  base: './',
  plugins: [react()],
})
