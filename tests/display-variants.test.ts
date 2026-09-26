// @vitest-environment happy-dom
import { act, createElement as e } from "react"
import { createRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { createApp, createSSRApp, h, nextTick } from "vue"
import { renderToString as renderVue } from "vue/server-renderer"
import { readFileSync, readdirSync } from "node:fs"
import { afterEach, describe, expect, it, vi } from "vitest"
import { Progress as RProgress } from "../registry/react/ui/progress"
import { Progress as VProgress } from "../registry/vue/ui/progress"
import { Checkbox as RCheckbox } from "../registry/react/ui/checkbox"
import { Checkbox as VCheckbox } from "../registry/vue/ui/checkbox"
import { Button as RButton } from "../registry/react/ui/button"
import { Button as VButton } from "../registry/vue/ui/button"
import { Badge as RBadge } from "../registry/react/ui/badge"
import { Badge as VBadge } from "../registry/vue/ui/badge"
import { ChartContainer, ChartTooltipContent as RTooltip } from "../registry/react/ui/chart"
import { ChartTooltipContent as VTooltip } from "../registry/vue/ui/chart"

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
const cleanups: (() => unknown)[] = []
afterEach(async () => {
  for (const c of cleanups.splice(0)) await c()
  document.body.innerHTML = ""
})
const vue = (node: () => ReturnType<typeof h>) => renderVue(createSSRApp({ render: node }))
const cls = (html: string, slot: string) => html.match(new RegExp(`data-slot="${slot}"[^>]*class="([^"]*)"|class="([^"]*)"[^>]*data-slot="${slot}"`))!.slice(1).find(Boolean)!

describe("progress colours by band", () => {
  it.each([
    ["react", () => renderToString(e(RProgress, { value: 40, variant: "success", indicatorClassName: "rounded-full" }))],
    ["vue", () => vue(() => h(VProgress, { modelValue: 40, variant: "success", indicatorClass: "rounded-full" }))],
  ])("%s: variant colours track and indicator; indicator class is settable", async (_, render) => {
    const html = await render()
    expect(cls(html, "progress")).toContain("bg-success/20")
    expect(cls(html, "progress-indicator")).toContain("bg-success")
    expect(cls(html, "progress-indicator")).toContain("rounded-full")
  })
})

describe("checkbox indeterminate", () => {
  it.each([
    ["react", () => renderToString(e(RCheckbox, { checked: "indeterminate", "aria-label": "Tout sélectionner" }))],
    ["vue", () => vue(() => h(VCheckbox, { modelValue: "indeterminate", "aria-label": "Tout sélectionner" }))],
  ])("%s: dash icon and checked look", async (_, render) => {
    const html = await render()
    expect(html).toContain('data-state="indeterminate"')
    expect(html).toContain("lucide-minus")
    expect(cls(html, "checkbox")).toContain("data-[state=indeterminate]:bg-primary")
  })
})

describe("icon button loading", () => {
  it("react: the spinner replaces the icon", () => {
    const html = renderToString(e(RButton, { size: "icon", loading: true, "aria-label": "Relancer" }, e("svg", { className: "the-icon" })))
    expect(html).not.toContain("the-icon")
    expect(html).toMatch(/animate-spin/)
  })
  it("vue: the spinner replaces the icon", async () => {
    const html = await vue(() => h(VButton, { size: "icon", loading: true, "aria-label": "Relancer" }, () => h("svg", { class: "the-icon" })))
    expect(html).not.toContain("the-icon")
    expect(html).toMatch(/animate-spin/)
  })
  it("react: a text button keeps its label beside the spinner", () => {
    expect(renderToString(e(RButton, { loading: true }, "Envoyer"))).toContain("Envoyer")
  })
})

describe.each([
  ["react", async (onRemove: () => void) => {
    const root = createRoot(document.body.appendChild(document.createElement("div")))
    await act(async () => root.render(e(RBadge, { onRemove, removeLabel: "Retirer Lyon" }, "Lyon")))
    cleanups.push(() => act(async () => root.unmount()))
  }],
  ["vue", async (onRemove: () => void) => {
    const app = createApp({ render: () => h(VBadge, { onRemove, removeLabel: "Retirer Lyon" }, () => "Lyon") })
    app.mount(document.body.appendChild(document.createElement("div")))
    cleanups.push(() => app.unmount())
    await nextTick()
  }],
])("%s removable badge", (_, mount) => {
  it("has a labelled close button that calls onRemove", async () => {
    const onRemove = vi.fn()
    await mount(onRemove)
    const button = document.querySelector<HTMLButtonElement>("[data-slot=badge] button")!
    expect(button.getAttribute("aria-label")).toBe("Retirer Lyon")
    button.click()
    expect(onRemove).toHaveBeenCalledTimes(1)
  })
})

describe("dropdown-menu disabled items keep pointer events (tooltip on why)", () => {
  const files = ["registry/react/ui/dropdown-menu.tsx", ...readdirSync("registry/vue/ui/dropdown-menu").map((f) => `registry/vue/ui/dropdown-menu/${f}`)]
  it.each(files)("%s", (file) => {
    expect(readFileSync(file, "utf8")).not.toContain("data-[disabled]:pointer-events-none")
  })
})

describe("chart tooltip values", () => {
  const payload = [{ name: "note", dataKey: "note", value: 12.345, color: "red", payload: {} }]
  it("react: French by default, valueFormatter overrides", () => {
    const render = (p: object) => renderToString(e(ChartContainer, { config: { note: { label: "Note" } } }, e(RTooltip as any, { active: true, payload, ...p })))
    expect(render({})).toContain("12,345")
    expect(render({ valueFormatter: (v: number) => `${v.toFixed(1)}/20` })).toContain("12.3/20")
  })
  it("vue: French by default, shows 0, valueFormatter overrides", async () => {
    const render = (p: object) => vue(() => h(VTooltip, { payload: { note: 0 }, config: { note: { label: "Note" } }, ...p }))
    expect(await render({})).toMatch(/>\s*0\s*</)
    const html = await vue(() => h(VTooltip, { payload: { note: 12.345 }, config: { note: { label: "Note" } }, valueFormatter: (v: number) => `${v.toFixed(1)}/20` }))
    expect(html).toContain("12.3/20")
  })
})
