import { describe, expect, it } from "vitest"
import { exampleErrors, parityErrors } from "../scripts/lib/parity.ts"
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
  it("accepts framework-only hooks, which need no twin and no demo", () => {
    const hook = { name: "use-mobile", type: "registry:hook" }
    const sidebar = { name: "sidebar", type: "registry:ui", registryDependencies: ["@saqara/use-mobile"] }
    const vueSidebar = { name: "sidebar", type: "registry:ui" }
    expect(parityErrors(m(sidebar, hook), m(vueSidebar), yes)).toEqual([])
  })
  it("flags a missing demo, but never for the theme", () => {
    const hasDemo = (fw: string) => fw === "react"
    expect(parityErrors(m(theme, button), m(theme, button), hasDemo)).toEqual(['vue "button" has no demo in src/vue/demos/'])
  })
})

describe("exampleErrors", () => {
  it("requires every example in both frameworks", () => {
    expect(exampleErrors(["annuaire", "connexion"], ["connexion"])).toEqual(['example "annuaire" is in react but not in vue'])
    expect(exampleErrors(["connexion"], ["connexion"])).toEqual([])
  })
})
