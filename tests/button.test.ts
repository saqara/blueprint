import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { readManifest } from "../scripts/lib/manifest.ts"

const item = (fw: "react" | "vue", name: string) => readManifest(`registry.${fw}.json`).items.find((i) => i.name === name)!

const buttons = { react: "registry/react/ui/button.tsx", vue: "registry/vue/ui/button/Button.vue" }
const spinners = { react: "registry/react/ui/spinner.tsx", vue: "registry/vue/ui/spinner/Spinner.vue" }

// Saqara: every app needs a busy button, and each one rewrote it around Blueprint's.
describe.each(Object.entries(buttons))("%s button `loading` (Saqara)", (fw, path) => {
  const src = readFileSync(path, "utf8")
  it("takes a `loading` prop that disables the button and marks it busy", () => {
    expect(src).toMatch(/loading/)
    expect(src).toMatch(/aria-busy/)
    expect(src).toMatch(/disabled \|\| loading|disabled\s*\|\|\s*loading/)
  })
  it("shows Blueprint's spinner, decorative, before the label it keeps", () => {
    expect(src).toMatch(/Spinner/)
    expect(src).toMatch(/aria-hidden/)
  })
  it("declares the spinner as a registry dependency", () => {
    expect(item(fw as "react" | "vue", "button").registryDependencies).toContain("@saqara/spinner")
  })
})

// Saqara: interface text is French, the accessible name of a lone spinner included.
describe.each(Object.entries(spinners))("%s spinner", (_, path) => {
  it("is labelled in French", () => {
    const src = readFileSync(path, "utf8")
    expect(src).toContain('aria-label="Chargement"')
    expect(src).not.toContain('aria-label="Loading"')
  })
})
