import { describe, expect, it } from "vitest"
import { themeItem, toCss } from "../scripts/lib/theme.ts"
import { upsertItem, type Manifest } from "../scripts/lib/manifest.ts"
import type { Tokens } from "../scripts/lib/contrast.ts"

const tokens: Tokens = {
  light: { radius: "0.375rem", primary: "#F04632" },
  dark: { radius: "0.375rem", primary: "#F04632" },
  theme: { "font-sans": "Lato" },
  css: { '@import "x.css"': {}, "@layer base": { h1: { "@apply font-heading": {} } } },
  contrastExceptions: [],
}

describe("themeItem", () => {
  it("maps every color var to a Tailwind color, but not radius", () => {
    const item = themeItem(tokens) as any
    expect(item.name).toBe("saqara-theme")
    expect(item.cssVars.theme["color-primary"]).toBe("var(--primary)")
    expect(item.cssVars.theme["color-radius"]).toBeUndefined()
    expect(item.cssVars.theme["font-sans"]).toBe("Lato")
    expect(item.cssVars.light.primary).toBe("#F04632")
    expect(item.css).toEqual(tokens.css)
  })
})

describe("toCss", () => {
  it("emits imports first, then :root, .dark and @theme inline", () => {
    const css = toCss(tokens)
    expect(css.indexOf('@import "x.css";')).toBe(0)
    expect(css).toContain(":root {\n  --radius: 0.375rem;\n  --primary: #F04632;\n}")
    expect(css).toContain(".dark {")
    expect(css).toContain("@theme inline {")
    expect(css).toContain("  --color-primary: var(--primary);")
    expect(css).toContain("@layer base {\n  h1 {\n    @apply font-heading;\n  }\n}")
  })
})

describe("upsertItem", () => {
  const m: Manifest = { $schema: "s", name: "saqara", homepage: "h", items: [{ name: "button", type: "registry:ui" }] }
  it("replaces an item by name and keeps saqara-theme first", () => {
    const next = upsertItem(upsertItem(m, { name: "badge", type: "registry:ui" }), { name: "saqara-theme", type: "registry:theme" })
    expect(next.items.map((i) => i.name)).toEqual(["saqara-theme", "badge", "button"])
    const replaced = upsertItem(next, { name: "button", type: "registry:ui", title: "B" })
    expect(replaced.items).toHaveLength(3)
    expect(replaced.items.find((i) => i.name === "button")!.title).toBe("B")
  })
})
