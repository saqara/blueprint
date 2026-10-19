import { describe, expect, it } from "vitest"
import { localize, npmDeps, plan, planAll, refreshItem, saqaraDeps } from "../scripts/lib/vendor.ts"

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
    expect(npmDeps(undefined, ['// extract error type from "ErrorType: message" format'])).toEqual([])
  })
})

describe("npmDeps versions", () => {
  it("keeps the upstream pinned spec instead of adding the bare import again", () => {
    expect(npmDeps(["recharts@3.8.0", "cn"], ['import { Line } from "recharts"', 'import { X } from "@scope/pkg"'])).toEqual(["@scope/pkg", "cn", "recharts@3.8.0"])
    expect(npmDeps(["@scope/pkg@^2"], ['import { X } from "@scope/pkg"'])).toEqual(["@scope/pkg@^2"])
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

describe("AI Elements", () => {
  const react = {
    name: "plan", type: "registry:component", dependencies: ["@radix-ui/react-use-controllable-state", "lucide-react"],
    registryDependencies: ["card", "https://elements.ai-sdk.dev/api/registry/shimmer.json"],
    files: [{ path: "registry/default/ai-elements/plan.tsx", type: "registry:component", target: "components/ai-elements/plan.tsx",
      content: 'import { cn } from "@/lib/utils";\nimport { useControllableState } from "@radix-ui/react-use-controllable-state";\nimport { Card } from "@/components/ui/card";\nimport { Button } from "@/registry/default/ui/button";\nimport { Shimmer } from "./shimmer";\n' }],
  }
  const vue = {
    name: "plan", type: "registry:component", registryDependencies: ["card", "shimmer"],
    files: [{ path: "components/ai-elements/plan/Plan.vue", type: "registry:component",
      content: "import { cn } from '@/lib/utils'\nimport { Card } from '@/components/ui/card'\nimport { Shimmer } from '@/components/ai-elements/shimmer'\n" }],
  }
  it("installs React items with the ui items, on the cn package and the radix-ui umbrella", () => {
    const { files, item } = plan(react, "react", () => false, false)
    expect(files[0].path).toBe("registry/react/ui/plan.tsx")
    expect(files[0].content).toContain('from "cn"')
    expect(files[0].content).toContain('from "radix-ui/internal"')
    expect(files[0].content).toContain('from "@/registry/react/ui/card"')
    expect(item).toEqual({
      name: "plan", type: "registry:ui", title: "Plan",
      dependencies: ["cn", "lucide-react", "radix-ui"],
      registryDependencies: ["@saqara/button", "@saqara/card", "@saqara/shimmer"],
      files: [{ path: "registry/react/ui/plan.tsx", type: "registry:ui" }],
    })
  })
  it("installs Vue items with the ui items", () => {
    const { files, item } = plan(vue, "vue", () => false, false)
    expect(files[0].path).toBe("registry/vue/ui/plan/Plan.vue")
    expect(files[0].content).toContain("'@/registry/vue/ui/shimmer'")
    expect(files[0].content).toContain("'@/lib/utils'")
    expect(item.registryDependencies).toEqual(["@saqara/card", "@saqara/shimmer"])
  })
})

describe("refreshItem", () => {
  it("re-reads files and dependencies from the adapted sources, keeping title and description", () => {
    const item = { name: "message", type: "registry:ui", title: "Message", description: "Bulle.", dependencies: ["ai", "streamdown"], registryDependencies: ["@saqara/tooltip"], files: [] }
    const files = [
      { path: "registry/vue/ui/message/Message.vue", content: "import { cn } from '@/lib/utils'\nimport { Button } from '@/registry/vue/ui/button'\nimport { X } from '@lucide/vue'\nimport { ctx } from './context'\n" },
      { path: "registry/vue/ui/message/context.ts", content: "import { inject } from 'vue'\n" },
    ]
    expect(refreshItem(item, files)).toEqual({
      name: "message", type: "registry:ui", title: "Message", description: "Bulle.",
      dependencies: ["@lucide/vue"], registryDependencies: ["@saqara/button"],
      files: files.map((f) => ({ path: f.path, type: "registry:ui" })),
    })
  })
})
