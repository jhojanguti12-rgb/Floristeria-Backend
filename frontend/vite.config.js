import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  preview: {
    allowedHosts: ['floristeria-api-v2.onrender.com'],
    host: '0.0.0.0',
    port: 5173,
    strictPort: true
  }
})