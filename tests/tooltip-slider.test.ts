import { createElement as e } from "react"
import { renderToString } from "react-dom/server"
import { createSSRApp, h } from "vue"
import { renderToString as renderVue } from "vue/server-renderer"
import { describe, expect, it } from "vitest"
import * as RT from "../registry/react/ui/tooltip"
import * as VT from "../registry/vue/ui/tooltip"
import { Button as RButton } from "../registry/react/ui/button"
import { Button as VButton } from "../registry/vue/ui/button"
import { Slider as RSlider } from "../registry/react/ui/slider"
import { Slider as VSlider } from "../registry/vue/ui/slider"

const vue = (node: () => ReturnType<typeof h>) => renderVue(createSSRApp({ render: node }))

describe("tooltip on a disabled trigger", () => {
  it("react: wraps a disabled child in a focusable span that carries the trigger", () => {
    const html = renderToString(e(RT.Tooltip, null, e(RT.TooltipTrigger, { asChild: true }, e(RButton, { disabled: true }, "Relancer")), e(RT.TooltipContent, null, "Déjà relancée")))
    expect(html).toMatch(/^<span(?=[^>]*data-slot="tooltip-trigger")(?=[^>]*tabindex="0")[^>]*><button[^>]*disabled/)
    const enabled = renderToString(e(RT.Tooltip, null, e(RT.TooltipTrigger, { asChild: true }, e(RButton, null, "Relancer"))))
    expect(enabled).toMatch(/^<button[^>]*data-slot="tooltip-trigger"/)
  })
  it("vue: wraps a disabled child in a focusable span that carries the trigger", async () => {
    const html = await vue(() => h(VT.Tooltip, () => h(VT.TooltipTrigger, { asChild: true }, () => h(VButton, { disabled: true }, () => "Relancer"))))
    expect(html).toMatch(/<span(?=[^>]*data-slot="tooltip-trigger")(?=[^>]*tabindex="0")[^>]*>(<!--[^>]*-->)*<button[^>]*disabled/)
  })
})

describe("slider marks", () => {
  const marks = [{ value: 6, label: "6" }, { value: 13, label: "13" }]
  it.each([
    ["react", () => Promise.resolve(renderToString(e(RSlider, { min: 0, max: 20, defaultValue: [10], marks })))],
    ["vue", () => vue(() => h(VSlider, { min: 0, max: 20, defaultValue: [10], marks }))],
  ])("%s: places each mark at its value along the track, with its label", async (_, render) => {
    const html = await render()
    expect(html).toMatch(/data-slot="slider-mark"[^>]*style="left:\s*30%/)
    expect(html).toMatch(/data-slot="slider-mark"[^>]*style="left:\s*65%/)
    expect(html).toMatch(/>\s*13\s*</)
  })
})
