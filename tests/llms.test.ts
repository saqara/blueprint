import { describe, expect, it } from "vitest"
import react from "../registry.react.json"
import vue from "../registry.vue.json"
import { llmsTxt } from "../scripts/lib/llms.ts"
import { BLOCKS, CATEGORIES } from "../site/catalog"

const txt = llmsTxt({ react, vue, categories: CATEGORIES, blocks: BLOCKS, site: "https://saqara.github.io/blueprint/" })

describe("llms.txt", () => {
  it("starts with a title and a summary (llms.txt format)", () => {
    expect(txt.startsWith("# Saqara Blueprint\n\n> ")).toBe(true)
  })
  it("explains how to install for both frameworks", () => {
    expect(txt).toContain('"@saqara": "https://saqara.github.io/blueprint/r/react/{name}.json"')
    expect(txt).toContain('"@saqara": "https://saqara.github.io/blueprint/r/vue/{name}.json"')
    expect(txt).toContain("npx shadcn@latest add @saqara/saqara-theme")
    expect(txt).toContain("npx shadcn-vue@latest add @saqara/saqara-theme")
  })
  it("lists every category item and block with its description and doc link", () => {
    for (const name of [...CATEGORIES.flatMap((c) => c.items), ...BLOCKS]) {
      const item = react.items.find((i) => i.name === name) as { description: string }
      expect(txt).toContain(`- [@saqara/${name}](https://saqara.github.io/blueprint/#/${BLOCKS.includes(name) ? "blocs" : "composants"}/${name}): ${item.description}`)
    }
  })
  it("groups items under their category headings", () => {
    for (const c of CATEGORIES) expect(txt).toContain(`## ${c.label}`)
    expect(txt).toContain("## Blocs")
  })
})
