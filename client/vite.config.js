import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(),tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      "/api": "https://resinart.onrender.com",
      "/uploads": "https://resinart.onrender.com"
    }
  }
});
