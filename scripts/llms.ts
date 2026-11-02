import { writeFileSync } from "node:fs"
import { BLOCKS, CATEGORIES } from "../site/catalog.ts"
import { llmsTxt } from "./lib/llms.ts"
import { readManifest } from "./lib/manifest.ts"
import { siteUrl } from "../site/lib/edition.ts"

writeFileSync("public/llms.txt", llmsTxt({
  react: readManifest("registry.react.json"),
  vue: readManifest("registry.vue.json"),
  categories: CATEGORIES,
  blocks: BLOCKS,
  site: siteUrl(),
}))
console.log("public/llms.txt written")
