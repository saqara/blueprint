import { createElement } from "react"
import { renderToString } from "react-dom/server"
import { createSSRApp, h } from "vue"
import { renderToString as renderVue } from "vue/server-renderer"
import { describe, expect, it } from "vitest"
import { MultiSelect as ReactMultiSelect, splitBadges as reactSplit, toggleValue as reactToggle } from "../registry/react/ui/multi-select"
import { MultiSelect as VueMultiSelect, splitBadges as vueSplit, toggleValue as vueToggle } from "../registry/vue/ui/multi-select"

const options = ["69", "75", "13", "33", "59"].map((v) => ({ value: v, label: `Dép. ${v}` }))
const helpers = { react: { toggleValue: reactToggle, splitBadges: reactSplit }, vue: { toggleValue: vueToggle, splitBadges: vueSplit } }
const render = {
  react: async (value: string[]) => renderToString(createElement(ReactMultiSelect, { options, value, onValueChange: () => {}, maxBadges: 3 })),
  vue: async (value: string[]) => renderVue(createSSRApp({ render: () => h(VueMultiSelect, { options, modelValue: value, maxBadges: 3 }) })),
}

describe.each(["react", "vue"] as const)("%s multi-select", (fw) => {
  it("toggles a value in and out, keeping the others", () => {
    expect(helpers[fw].toggleValue(["69"], "75")).toEqual(["69", "75"])
    expect(helpers[fw].toggleValue(["69", "75"], "69")).toEqual(["75"])
  })
  it("splits badges into shown and a +N count", () => {
    expect(helpers[fw].splitBadges([1, 2, 3, 4, 5], 3)).toEqual({ shown: [1, 2, 3], hidden: 2 })
    expect(helpers[fw].splitBadges([1], 3)).toEqual({ shown: [1], hidden: 0 })
  })
  it("shows the placeholder when nothing is selected", async () => {
    expect(await render[fw]([])).toContain("Sélectionner…")
  })
  it("shows 3 badges in options order and +2", async () => {
    const html = await render[fw](["59", "13", "69", "33", "75"])
    expect(html).toContain("+2")
    const order = ["Dép. 69", "Dép. 75", "Dép. 13"].map((l) => html.indexOf(l))
    expect(order.every((i) => i >= 0)).toBe(true)
    expect([...order].sort((a, b) => a - b)).toEqual(order)
    expect(html).not.toContain("Dép. 33")
  })
})
