// @vitest-environment happy-dom
import { act, createElement as e } from "react"
import { createRoot } from "react-dom/client"
import { createApp, h, nextTick } from "vue"
import { afterEach, describe, expect, it, vi } from "vitest"
import { TagInput as RTagInput } from "../registry/react/ui/tag-input"
import { TagInput as VTagInput } from "../registry/vue/ui/tag-input"

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
const cities = ["Lyon", "Lille", "Limoges", "Laval", "Lens", "Lorient", "Paris"]
const cleanups: (() => unknown)[] = []
afterEach(async () => {
  for (const c of cleanups.splice(0)) await c()
  document.body.innerHTML = ""
})
const input = () => document.querySelector<HTMLInputElement>("[data-slot=tag-input] input")!
const options = () => [...document.querySelectorAll("[role=option]")].map((o) => o.textContent?.trim())
const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!

type Mount = (props: Record<string, unknown>, slots?: Record<string, (p: any) => unknown>) => Promise<(fn: () => void) => Promise<void>>
const mounts: Record<"react" | "vue", Mount> = {
  react: async (props) => {
    const root = createRoot(document.body.appendChild(document.createElement("div")))
    await act(async () => root.render(e(RTagInput as any, { value: [], onValueChange: () => {}, "aria-label": "Villes", ...props })))
    cleanups.push(() => act(async () => root.unmount()))
    return async (fn) => { await act(async () => fn()) }
  },
  vue: async (props, slots) => {
    const app = createApp({ render: () => h(VTagInput as any, { "aria-label": "Villes", ...props }, slots) })
    app.mount(document.body.appendChild(document.createElement("div")))
    cleanups.push(() => app.unmount())
    await nextTick()
    return async (fn) => { fn(); await nextTick() }
  },
}
const type = (text: string) => { setValue.call(input(), text); input().dispatchEvent(new Event("input", { bubbles: true })) }
const enter = () => input().dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }))

describe.each(["react", "vue"] as const)("%s tag-input suggestions", (fw) => {
  it("caps the list with maxSuggestions", async () => {
    const run = await mounts[fw]({ suggestions: cities, maxSuggestions: 3 })
    await run(() => input().focus())
    expect(options()).toHaveLength(3)
  })
  it("shows an empty message for a closed catalogue, and takes a custom one", async () => {
    const run = await mounts[fw]({ suggestions: cities, allowCreate: false })
    await run(() => { input().focus(); type("zzz") })
    expect(document.body.textContent).toContain("Aucun résultat.")
    for (const c of cleanups.splice(0)) await c()
    document.body.innerHTML = ""
    const run2 = await mounts[fw]({ suggestions: cities, emptyMessage: "Aucune ville." })
    await run2(() => { input().focus(); type("zzz") })
    expect(document.body.textContent).toContain("Aucune ville.")
  })
  it("renders suggestions with renderSuggestion / #suggestion", async () => {
    const run = fw === "react"
      ? await mounts.react({ suggestions: cities, renderSuggestion: (s: string) => e("strong", null, `★ ${s}`) })
      : await mounts.vue({ suggestions: cities }, { suggestion: ({ suggestion }: { suggestion: string }) => h("strong", `★ ${suggestion}`) })
    await run(() => input().focus())
    expect(document.querySelector("[role=option] strong")?.textContent).toBe("★ Lyon")
  })
  it("picks one value with onSelect, without adding a tag", async () => {
    const onSelect = vi.fn()
    const onValueChange = vi.fn()
    const run = await mounts[fw]({ suggestions: cities, onSelect, onValueChange, "onUpdate:modelValue": onValueChange })
    await run(() => { input().focus(); type("Lyo") })
    await run(() => enter())
    expect(onSelect).toHaveBeenCalledWith("Lyon")
    expect(onValueChange).not.toHaveBeenCalled()
    expect(input().value).toBe("")
  })
  it("supports a controlled query (server search)", async () => {
    const onQueryChange = vi.fn()
    const run = await mounts[fw]({ suggestions: cities, query: "Li", onQueryChange, "onUpdate:query": onQueryChange })
    expect(input().value).toBe("Li")
    await run(() => type("Lil"))
    expect(onQueryChange).toHaveBeenCalledWith("Lil")
  })
})
