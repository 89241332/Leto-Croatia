import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 30053,
    proxy: {
      '/api': 'http://localhost:30052',
    },
  },
})