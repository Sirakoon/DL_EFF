import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    port: 8080,
    // pot: 5173,
    proxy: {
      "/api": "http://localhost:80",
      // "/api": "http://10.240.162.11:80",
      //"/api": "http://10.245.97.200:80",
      "/uploads": "http://localhost:80",
      // "/uploads": "http://10.240.162.11:80",
      //"/uploads": "http://10.245.97.200:80",
    },
  },
})

