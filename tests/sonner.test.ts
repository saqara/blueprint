import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { readManifest } from "../scripts/lib/manifest.ts"

const sonnerDeps = (fw: "react" | "vue") =>
  (readManifest(`registry.${fw}.json`).items.find((i) => i.name === "sonner")!.dependencies as string[])

describe("sonner (Saqara)", () => {
  it("React Toaster does not depend on next-themes (apps pass `theme`)", () => {
    expect(readFileSync("registry/react/ui/sonner.tsx", "utf8")).not.toContain("next-themes")
    expect(sonnerDeps("react")).not.toContain("next-themes")
  })
  it("React Toaster defaults to light like vue-sonner (apps drive dark mode with a class, not the OS)", () => {
    expect(readFileSync("registry/react/ui/sonner.tsx", "utf8")).toContain('theme = "light"')
  })
  it("Vue Toaster ships the vue-sonner stylesheet", () => {
    expect(readFileSync("registry/vue/ui/sonner/Sonner.vue", "utf8")).toContain('import "vue-sonner/style.css"')
  })

  const sources = { react: "registry/react/ui/sonner.tsx", vue: "registry/vue/ui/sonner/Sonner.vue" }
  it.each(Object.entries(sources))("%s toasts are tinted from Saqara tokens, like Alert", (_, path) => {
    const src = readFileSync(path, "utf8")
    expect(src).toMatch(/rich-?colors/i)
    for (const [type, token] of [["success", "success"], ["info", "info"], ["warning", "warning"], ["error", "destructive"]]) {
      expect(src).toContain(`"--${type}-bg": "color-mix(in oklab, var(--${token}) 10%, var(--popover))"`.replaceAll('"', path.endsWith(".vue") ? "'" : '"'))
      expect(src).toContain(`text-${token}`)
    }
    expect(src).toContain("text-muted-foreground")
  })
})
