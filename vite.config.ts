import { fileURLToPath } from "node:url"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import vue from "@vitejs/plugin-vue"
import tailwindcss from "@tailwindcss/vite"

const root = fileURLToPath(new URL(".", import.meta.url))

export default defineConfig({
  base: "/blueprint/",
  plugins: [react(), vue(), tailwindcss()],
  resolve: { alias: { "@": root } },
  build: {
    rollupOptions: {
      input: { index: `${root}index.html`, react: `${root}react.html`, vue: `${root}vue.html` },
    },
  },
})
