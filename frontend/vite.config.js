import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['floristeria-api-v2.onrender.com'], // Esto quita el error de pantalla negra
    host: '0.0.0.0',
    port: 5173
  },
  preview: {
    allowedHosts: ['floristeria-api-v2.onrender.com'], // También para el modo producción
    host: '0.0.0.0',
    port: 5173
  }
})