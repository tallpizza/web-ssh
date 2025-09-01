import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 8020,
    proxy: {
      '/api': {
        target: 'http://localhost:8022',
        changeOrigin: true
      }
    }
  }
})