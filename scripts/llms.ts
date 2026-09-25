import { writeFileSync } from "node:fs"
import { BLOCKS, CATEGORIES } from "../site/catalog.ts"
import { llmsTxt } from "./lib/llms.ts"
import { readManifest } from "./lib/manifest.ts"

writeFileSync("public/llms.txt", llmsTxt({
  react: readManifest("registry.react.json"),
  vue: readManifest("registry.vue.json"),
  categories: CATEGORIES,
  blocks: BLOCKS,
  site: "https://saqara.github.io/blueprint/",
}))
console.log("public/llms.txt written")
