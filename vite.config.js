import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react(),
  base: '/Felicity-Sight-Words/',
  server: {
    host: true,
    port: 5173,
  },
})
