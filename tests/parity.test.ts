import { describe, expect, it } from "vitest"
import { parityErrors } from "../scripts/lib/parity.ts"
import type { Item, Manifest } from "../scripts/lib/manifest.ts"

const m = (...items: Item[]): Manifest => ({ $schema: "", name: "saqara", homepage: "", items })
const theme = { name: "saqara-theme", type: "registry:theme" }
const button = { name: "button", type: "registry:ui" }
const yes = () => true

describe("parityErrors", () => {
  it("passes for identical manifests with demos", () => {
    expect(parityErrors(m(theme, button), m(theme, button), yes)).toEqual([])
  })
  it("flags an item missing from one framework", () => {
    expect(parityErrors(m(theme, button), m(theme), yes)).toEqual(['"button" is in react but not in vue'])
  })
  it("flags a dangling @saqara dependency", () => {
    const dialog = { name: "dialog", type: "registry:ui", registryDependencies: ["@saqara/button"] }
    expect(parityErrors(m(dialog), m(dialog), yes)).toEqual([
      'react "dialog" depends on missing "@saqara/button"',
      'vue "dialog" depends on missing "@saqara/button"',
    ])
  })
  it("flags a missing demo, but never for the theme", () => {
    const hasDemo = (fw: string) => fw === "react"
    expect(parityErrors(m(theme, button), m(theme, button), hasDemo)).toEqual(['vue "button" has no demo in src/vue/demos/'])
  })
})
