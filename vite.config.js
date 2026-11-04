import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/incidencias-api': {
        target: 'http://localhost',
        changeOrigin: true,
      },
    },
  },
})
