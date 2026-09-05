import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // production build is served directly by the backend (Express static +
    // SPA fallback) — emit straight into Backend/public so `npm run build`
    // is the only step needed before starting the server
    outDir: "../Backend/public",
    emptyOutDir: true,
  },
  server: {
    host: "0.0.0.0",
    port: 8080,
    // pot: 5173,
    proxy: {
      "/api": "http://localhost:80",
      //"/api": "http://10.245.97.200:80",
      // "/api": "http://10.240.162.3:80/api",
      // "/api": "http://10.245.98.26:80", 


      "/uploads": "http://localhost:80",
      // "/uploads": "http://10.240.162.3:80/api",
      // "/uploads": "http://10.245.98.26:80",
      //"/uploads": "http://10.245.97.200:80",
    },
  },
})

