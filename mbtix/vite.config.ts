import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'window'
  },
  server: {
    host: true,        // LAN 내 다른 PC 접속 허용
    port: 5173,
    strictPort: true
  }
})