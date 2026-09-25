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
  it("Vue Toaster ships the vue-sonner stylesheet", () => {
    expect(readFileSync("registry/vue/ui/sonner/Sonner.vue", "utf8")).toContain('import "vue-sonner/style.css"')
  })
})
