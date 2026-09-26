// @vitest-environment happy-dom
import { act, createElement as e } from "react"
import { createRoot } from "react-dom/client"
import { createApp, h, nextTick } from "vue"
import { afterEach, describe, expect, it, vi } from "vitest"
import { Autocomplete as RAuto } from "../registry/react/ui/autocomplete"
import { Autocomplete as VAuto } from "../registry/vue/ui/autocomplete"
import { RatingGrid as RGrid } from "../registry/react/ui/rating-grid"
import { RatingGrid as VGrid } from "../registry/vue/ui/rating-grid"

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
const cleanups: (() => unknown)[] = []
afterEach(async () => {
  for (const c of cleanups.splice(0)) await c()
  document.body.innerHTML = ""
})
const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!
const addresses = [
  { value: "1", label: "12 rue de la République", description: "69002 Lyon" },
  { value: "2", label: "12 rue de la Paix", description: "75002 Paris" },
]

type Mount = (Comp: "auto" | "grid", props: Record<string, unknown>) => Promise<(fn: () => void) => Promise<void>>
const mounts: Record<"react" | "vue", Mount> = {
  react: async (comp, props) => {
    const root = createRoot(document.body.appendChild(document.createElement("div")))
    await act(async () => root.render(e((comp === "auto" ? RAuto : RGrid) as any, props)))
    cleanups.push(() => act(async () => root.unmount()))
    return async (fn) => { await act(async () => fn()) }
  },
  vue: async (comp, props) => {
    const app = createApp({ render: () => h((comp === "auto" ? VAuto : VGrid) as any, props) })
    app.mount(document.body.appendChild(document.createElement("div")))
    cleanups.push(() => app.unmount())
    await nextTick()
    return async (fn) => { fn(); await nextTick() }
  },
}

describe.each(["react", "vue"] as const)("%s autocomplete", (fw) => {
  const input = () => document.querySelector<HTMLInputElement>("[role=combobox]")!
  const key = (k: string) => input().dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true }))
  it("reports typing, shows suggestions and picks one with the keyboard, focus kept in the field", async () => {
    const onValueChange = vi.fn()
    const onSelect = vi.fn()
    const run = await mounts[fw]("auto", { value: "12 rue", suggestions: addresses, onValueChange, "onUpdate:value": onValueChange, onSelect, "aria-label": "Adresse" })
    await run(() => { input().focus(); setValue.call(input(), "12 rue d"); input().dispatchEvent(new Event("input", { bubbles: true })) })
    expect(onValueChange).toHaveBeenLastCalledWith("12 rue d")
    expect(document.querySelectorAll("[role=option]")).toHaveLength(2)
    expect(input().getAttribute("aria-expanded")).toBe("true")
    await run(() => key("ArrowDown"))
    await run(() => key("Enter"))
    expect(onSelect).toHaveBeenCalledWith(addresses[1])
    expect(document.activeElement).toBe(input())
  })
  it("announces loading and an empty result", async () => {
    const run = await mounts[fw]("auto", { value: "zzz", suggestions: [], loading: true, "aria-label": "Adresse" })
    await run(() => input().focus())
    expect(document.querySelector("[role=status]")?.textContent).toContain("Recherche…")
    for (const c of cleanups.splice(0)) await c()
    document.body.innerHTML = ""
    const run2 = await mounts[fw]("auto", { value: "zzz", suggestions: [], emptyMessage: "Aucun résultat.", "aria-label": "Adresse" })
    await run2(() => input().focus())
    expect(document.querySelector("[role=status]")?.textContent).toContain("Aucun résultat")
  })
})

describe.each(["react", "vue"] as const)("%s rating-grid", (fw) => {
  const criteria = [{ id: "delais", label: "Respect des délais" }, { id: "qualite", label: "Qualité d'exécution" }]
  it("renders one native radio group per criterion, labelled, and reports the choice", async () => {
    const onValueChange = vi.fn()
    const run = await mounts[fw]("grid", { criteria, value: { delais: "4" }, onValueChange, "onUpdate:value": onValueChange, caption: "Évaluation qualité" })
    const radios = [...document.querySelectorAll<HTMLInputElement>("input[type=radio]")]
    expect(radios).toHaveLength(12)
    expect(new Set(radios.map((r) => r.name)).size).toBe(2)
    const four = radios.find((r) => r.name.endsWith("delais") && r.value === "4")!
    expect(four.checked).toBe(true)
    expect(four.getAttribute("aria-label")).toBe("Respect des délais : 4")
    await run(() => radios.find((r) => r.name.endsWith("qualite") && r.value === "2")!.click())
    expect(onValueChange).toHaveBeenLastCalledWith({ delais: "4", qualite: "2" })
    expect(document.querySelector("caption")?.textContent).toBe("Évaluation qualité")
  })
})

describe.each(["react", "vue"] as const)("%s autocomplete follow-ups", (fw) => {
  const input = () => document.querySelector<HTMLInputElement>("[role=combobox]")!
  it("keeps the previous suggestions visible while loading", async () => {
    const run = await mounts[fw]("auto", { value: "12 rue", suggestions: addresses, loading: true, "aria-label": "Adresse" })
    await run(() => input().focus())
    expect(document.querySelectorAll("[role=option]")).toHaveLength(2)
    expect(document.querySelector("[role=status]")).toBeNull()
  })
  it("shows no empty message unless one is given", async () => {
    const run = await mounts[fw]("auto", { value: "zzz", suggestions: [], "aria-label": "Adresse" })
    await run(() => input().focus())
    expect(document.querySelector("[role=status]")).toBeNull()
  })
  it("takes a leading icon and a class for the input", async () => {
    await mounts[fw]("auto", { value: "", suggestions: [], "aria-label": "Adresse", inputClassName: "h-10", inputClass: "h-10", ...(fw === "react" ? { icon: e("svg", { "data-icon": "" }) } : {}) })
    expect(input().className).toContain("h-10")
    if (fw === "react") {
      expect(document.querySelector("[data-slot=autocomplete] svg[data-icon]")).not.toBeNull()
      expect(input().className).toContain("pl-9")
    }
  })
})

describe.each(["react", "vue"] as const)("%s rating-grid follow-ups", (fw) => {
  const criteria = [{ id: "delais", label: "Respect des délais", description: "Planning tenu" }]
  it("spreads getRowProps, and readOnly locks radios legibly", async () => {
    await mounts[fw]("grid", { criteria, value: { delais: "3" }, readOnly: true, getRowProps: (c: { id: string }) => ({ "data-testid": `evaluation-form-question-${c.id}` }) })
    expect(document.querySelector("tr[data-testid=evaluation-form-question-delais]")).not.toBeNull()
    const radio = document.querySelector<HTMLInputElement>("input[type=radio]")!
    expect(radio.disabled).toBe(true)
    expect(radio.className).toContain("disabled:opacity-100")
  })
})

