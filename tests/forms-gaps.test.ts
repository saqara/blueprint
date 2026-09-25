// @vitest-environment happy-dom
import { act, createElement as e } from "react"
import { createRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { createApp, createSSRApp, h, nextTick } from "vue"
import { renderToString as renderVue } from "vue/server-renderer"
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest"
import { FieldLabel as RFieldLabel } from "../registry/react/ui/field"
import { FieldLabel as VFieldLabel } from "../registry/vue/ui/field"
import { Textarea as RTextarea } from "../registry/react/ui/textarea"
import { Textarea as VTextarea } from "../registry/vue/ui/textarea"
import { MultiSelect as RMulti } from "../registry/react/ui/multi-select"
import { MultiSelect as VMulti } from "../registry/vue/ui/multi-select"

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
beforeAll(() => {
  // cmdk / reka listbox helpers absent from happy-dom.
  Element.prototype.scrollIntoView ??= () => {}
  globalThis.ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} } as never
})
const cleanups: (() => unknown)[] = []
afterEach(async () => {
  for (const c of cleanups.splice(0)) await c()
  document.body.innerHTML = ""
})
const vue = (node: () => ReturnType<typeof h>) => renderVue(createSSRApp({ render: node }))

describe("field label required", () => {
  it("react marks the label with a hidden asterisk", () => {
    expect(renderToString(e(RFieldLabel, { required: true, htmlFor: "siret" }, "SIRET"))).toMatch(/SIRET(<!--[^>]*-->)?<span aria-hidden="true" class="[^"]*text-destructive[^"]*">\*<\/span>/)
    expect(renderToString(e(RFieldLabel, { htmlFor: "siret" }, "SIRET"))).not.toContain(">*<")
  })
  it("vue marks the label with a hidden asterisk", async () => {
    expect(await vue(() => h(VFieldLabel, { required: true, for: "siret" }, () => "SIRET"))).toMatch(/SIRET(<!--[^>]*-->)*<span aria-hidden="true" class="[^"]*text-destructive[^"]*">\*<\/span>/)
  })
})

describe("textarea rows", () => {
  it("react honours rows as a minimum height, and can stop auto-resizing", () => {
    expect(renderToString(e(RTextarea, { rows: 6 }))).toMatch(/min-height:calc\(6lh \+ 1rem \+ 2px\)/)
    expect(renderToString(e(RTextarea, { autoResize: false }))).not.toContain("field-sizing-content")
    expect(renderToString(e(RTextarea))).toContain("field-sizing-content")
  })
  it("vue honours rows as a minimum height, and can stop auto-resizing", async () => {
    expect(await vue(() => h(VTextarea, { rows: 6 }))).toMatch(/min-height:calc\(6lh \+ 1rem \+ 2px\)/)
    expect(await vue(() => h(VTextarea, { autoResize: false }))).not.toContain("field-sizing-content")
  })
})

const agencies = [{ value: "lyon", label: "Lyon" }, { value: "lille", label: "Lille" }, { value: "paris", label: "Paris" }]
const props = {
  options: agencies,
  display: "count",
  countLabel: (n: number) => `${n} agence${n > 1 ? "s" : ""}`,
  selectAllLabel: "Toutes les agences",
  triggerProps: { "data-testid": "agency-select", "aria-label": "Agences" },
  getOptionProps: (o: { value: string }) => ({ "data-testid": `agency-option-${o.value}` }),
}
const trigger = () => document.querySelector<HTMLElement>("[data-testid=agency-select]")!

describe.each([
  ["react", async (p: Record<string, unknown>) => {
    const root = createRoot(document.body.appendChild(document.createElement("div")))
    await act(async () => root.render(e(RMulti as any, { ...props, ...p })))
    cleanups.push(() => act(async () => root.unmount()))
    return (fn: () => void) => act(async () => fn())
  }],
  ["vue", async (p: Record<string, unknown>) => {
    const app = createApp({ render: () => h(VMulti as any, { ...props, ...p }) })
    app.mount(document.body.appendChild(document.createElement("div")))
    cleanups.push(() => app.unmount())
    await nextTick()
    return async (fn: () => void) => { fn(); await nextTick(); await new Promise((r) => setTimeout(r, 20)) }
  }],
])("%s multi-select", (fw, mount) => {
  const change = vi.fn()
  const listen = fw === "react" ? { onValueChange: change } : { "onUpdate:modelValue": change }
  const value = (v: string[]) => (fw === "react" ? { value: v } : { modelValue: v })
  afterEach(() => change.mockReset())

  it("summarises with a count, and the select-all label when everything is chosen", async () => {
    await mount({ ...value(["lyon", "lille"]), ...listen })
    expect(trigger().textContent).toContain("2 agences")
    for (const c of cleanups.splice(0)) await c()
    await mount({ ...value(["lyon", "lille", "paris"]), ...listen })
    expect(trigger().textContent).toContain("Toutes les agences")
  })
  it("passes attributes to the trigger and the options, and selects all from the first entry", async () => {
    const run = await mount({ ...value(["lyon"]), ...listen })
    expect(trigger().getAttribute("aria-label")).toBe("Agences")
    await run(() => trigger().click())
    expect(document.querySelector("[data-testid=agency-option-paris]")).not.toBeNull()
    await run(() => [...document.querySelectorAll<HTMLElement>("[data-slot=command-item]")].find((i) => i.textContent?.includes("Toutes les agences"))!.click())
    expect(change).toHaveBeenLastCalledWith(["lyon", "lille", "paris"])
  })
})
