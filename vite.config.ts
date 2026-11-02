/// <reference types="vitest/config" />
import { fileURLToPath } from "node:url"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import vue from "@vitejs/plugin-vue"
import tailwindcss from "@tailwindcss/vite"
import { basePath, siteUrl } from "./site/lib/edition.ts"

const root = fileURLToPath(new URL(".", import.meta.url))
// %VITE_SITE% in index.html (og:image).
process.env.VITE_SITE = siteUrl()

export default defineConfig({
  base: basePath(),
  plugins: [react(), vue(), tailwindcss()],
  resolve: { alias: { "@": root } },
  test: { setupFiles: ["tests/setup.ts"] },
  build: {
    rollupOptions: {
      input: { index: `${root}index.html`, react: `${root}react.html`, vue: `${root}vue.html` },
    },
  },
})
