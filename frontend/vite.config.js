import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Hemos quitado la importación de tailwindcss de aquí para evitar el error de "Module Not Found"
export default defineConfig({
  plugins: [
    react()
  ],
  server: {
    host: '0.0.0.0',
    port: 5173
  }
})