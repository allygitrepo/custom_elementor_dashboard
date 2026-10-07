import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Ensures assets are relative so 'dist' works inside any root or subfolder on any live domain
  server: {
    port: 5173,
    proxy: {
      '/server': {
        target: 'http://localhost/Elementor_Dashboard',
        changeOrigin: true,
      }
    }
  }
})
