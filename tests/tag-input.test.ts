import { createElement } from "react"
import { renderToString } from "react-dom/server"
import { createSSRApp, h } from "vue"
import { renderToString as renderVue } from "vue/server-renderer"
import { describe, expect, it } from "vitest"
import * as R from "../registry/react/ui/tag-input"
import * as V from "../registry/vue/ui/tag-input"

const catalog = ["Gros œuvre", "Électricité", "Plomberie", "Menuiserie", "Peinture"]

describe.each([["react", R], ["vue", V]] as const)("%s tag-input logic", (_, m) => {
  it("normalizes spaces and ignores empty input", () => {
    expect(m.addTags([], ["  Lot   A  "], {})).toEqual(["Lot A"])
    expect(m.addTags(["x"], ["   "], {})).toEqual(["x"])
  })
  it("ignores duplicates regardless of case and accents", () => {
    expect(m.addTags(["Électricité"], ["electricite", "ÉLECTRICITÉ"], {})).toEqual(["Électricité"])
  })
  it("uses the catalogue spelling for a matching suggestion", () => {
    expect(m.addTags([], ["plomberie"], { suggestions: catalog })).toEqual(["Plomberie"])
  })
  it("refuses unknown values when creation is disabled", () => {
    expect(m.addTags([], ["Charpente", "peinture"], { suggestions: catalog, allowCreate: false })).toEqual(["Peinture"])
  })
  it("stops at maxTags", () => {
    expect(m.addTags(["a"], ["b", "c"], { maxTags: 2 })).toEqual(["a", "b"])
  })
  it("filters suggestions by folded text, hiding the chosen ones", () => {
    expect(m.filterSuggestions(catalog, "ELEC", [])).toEqual(["Électricité"])
    expect(m.filterSuggestions(catalog, "", ["Plomberie"], 3)).toEqual(["Gros œuvre", "Électricité", "Menuiserie"])
  })
})

describe("tag-input rendering", () => {
  it.each([
    ["react", () => Promise.resolve(renderToString(createElement(R.TagInput, { value: ["Plomberie"], onValueChange: () => {}, "aria-label": "Lots" })))],
    ["vue", () => renderVue(createSSRApp({ render: () => h(V.TagInput, { modelValue: ["Plomberie"], "aria-label": "Lots" }) }))],
  ])("%s renders tags with an accessible remove button", async (_, render) => {
    const html = await render()
    expect(html).toContain("Plomberie")
    expect(html).toContain('aria-label="Retirer Plomberie"')
    expect(html).toContain('role="combobox"')
  })
})
