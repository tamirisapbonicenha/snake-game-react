import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // caminhos relativos: funciona em localhost e em subpasta (GitHub Pages)
  base: './',
  plugins: [react()],
})
