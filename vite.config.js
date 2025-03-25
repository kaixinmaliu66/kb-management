import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from 'tailwindcss'
import { fileURLToPath, URL } from "node:url";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  css: {
    postcss: {
      plugins: [tailwindcss],
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
    extensions: [".js", ".json", ".jsx", ".mjs", ".ts", ".tsx", ".vue"],
  },
  server: {
    host: true,
    // port: 3000,
    proxy: {
      "/api": {
        // target: "http://10.10.10.72:9090/bfi/",
        target: "http://localhost:3000/",
        // target: "http://localhost:8080/bfi/",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },

    },
  },
})
