import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 8020,
    host: '0.0.0.0', // Allow access from any origin
    cors: true
  }
})