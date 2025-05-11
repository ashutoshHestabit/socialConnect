import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],

  // Dev server settings (npm run dev or npm run dev:local)
  server: {
    host: true,             // listen on 0.0.0.0
    port: 5173,
    allowedHosts: [
      "localhost",
      "testingsocialmedia-1.onrender.com"
    ],
    proxy: {
      "/api": {
        target: "https://socialconnect-2x58.onrender.com",
        changeOrigin: true,
        secure: true
      }
    }
  },

  // Preview server settings (npm run preview)
  preview: {
    host: true,
    port: 4173,
    allowedHosts: [
      "localhost",
      "https://socialconnect-2x58.onrender.com"
    ],
    hmr: false             // disable HMR ping in preview
  }
})