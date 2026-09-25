import { describe, expect, it } from "vitest"
import { localize, npmDeps, plan, planAll, saqaraDeps } from "../scripts/lib/vendor.ts"

const upstream = {
  name: "radio-group",
  type: "registry:ui",
  dependencies: ["reka-ui"],
  registryDependencies: ["utils", "label"],
  files: [{ path: "registry/new-york-v4/ui/radio-group/RadioGroup.vue", type: "registry:ui",
    content: 'import { cn } from "@/lib/utils"\nimport { Button } from "@/registry/new-york-v4/ui/button"\n' }],
}

describe("localize", () => {
  it("rewrites paths and imports to the framework folder", () => {
    expect(localize('from "@/registry/new-york-v4/ui/button"', "react")).toBe('from "@/registry/react/ui/button"')
    expect(localize("registry/new-york-v4/ui/button/Button.vue", "vue")).toBe("registry/vue/ui/button/Button.vue")
  })
})

describe("saqaraDeps", () => {
  it("merges upstream deps and imports, drops utils, namespaces and sorts", () => {
    expect(saqaraDeps(["utils", "label"], [upstream.files[0].content])).toEqual(["@saqara/button", "@saqara/label"])
  })
  it("handles missing upstream deps and self-imports", () => {
    expect(saqaraDeps(undefined, ['from "@/registry/new-york-v4/ui/radio-group"'], "radio-group")).toEqual([])
  })
})

describe("npmDeps", () => {
  it("adds bare imports upstream forgot to declare, skipping frameworks, aliases and relatives", () => {
    const src = [
      'import * as React from "react"\nimport { cva } from "class-variance-authority"\nimport { Slot } from "radix-ui"',
      'import { X } from "@lucide/vue/icons"\nimport a from "./Dialog.vue"\nimport { cn } from "@/lib/utils"\nimport { ref } from "vue"',
    ]
    expect(npmDeps(["radix-ui"], src)).toEqual(["@lucide/vue", "class-variance-authority", "radix-ui"])
  })
})

describe("plan", () => {
  it("builds localized files and a manifest item", () => {
    const { files, item } = plan(upstream, "vue", () => false, false)
    expect(files[0].path).toBe("registry/vue/ui/radio-group/RadioGroup.vue")
    expect(files[0].content).toContain('"@/registry/vue/ui/button"')
    expect(item).toEqual({
      name: "radio-group",
      type: "registry:ui",
      title: "Radio Group",
      dependencies: ["reka-ui"],
      registryDependencies: ["@saqara/button", "@saqara/label"],
      files: [{ path: "registry/vue/ui/radio-group/RadioGroup.vue", type: "registry:ui" }],
    })
  })
  it("refuses to overwrite an existing (possibly customized) file", () => {
    expect(() => plan(upstream, "vue", () => true, false)).toThrow(/already exists.*--force/)
  })
  it("overwrites with force", () => {
    expect(plan(upstream, "vue", () => true, true).files).toHaveLength(1)
  })
})

describe("planAll", () => {
  const item = (name: string) => ({ name, type: "registry:ui", files: [{ path: `registry/new-york-v4/ui/${name}.tsx`, type: "registry:ui", content: "" }] })
  const fetchItem = async (fw: string, name: string) => {
    if (fw === "vue" && name === "missing") throw new Error(`upstream vue has no "missing"`)
    return item(name)
  }

  it("plans every framework before anything can be written", async () => {
    const planned = await planAll(["a", "b"], fetchItem, () => false, false)
    expect(planned.react.map((p) => p.item.name)).toEqual(["a", "b"])
    expect(planned.vue.map((p) => p.item.name)).toEqual(["a", "b"])
  })

  it("rejects as a whole when one framework lacks an item, so no files are written", async () => {
    await expect(planAll(["a", "missing"], fetchItem, () => false, false)).rejects.toThrow('upstream vue has no "missing"')
  })
})
