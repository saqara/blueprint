// @vitest-environment happy-dom
import { act, createElement as e } from "react"
import { createRoot } from "react-dom/client"
import { createApp, h, nextTick } from "vue"
import { afterEach, describe, expect, it, vi } from "vitest"
import * as RS from "../registry/react/ui/sheet"
import * as VS from "../registry/vue/ui/sheet"
import { CollapsibleSection as RSection } from "../registry/react/ui/collapsible-section"
import { CollapsibleSection as VSection } from "../registry/vue/ui/collapsible-section"

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
const cleanups: (() => unknown)[] = []
afterEach(async () => {
  for (const c of cleanups.splice(0)) await c()
  document.body.innerHTML = ""
})
async function react(node: ReturnType<typeof e>) {
  const root = createRoot(document.body.appendChild(document.createElement("div")))
  await act(async () => root.render(node))
  cleanups.push(() => act(async () => root.unmount()))
  return (fn: () => void) => act(async () => fn())
}
async function vue(render: () => ReturnType<typeof h>) {
  const app = createApp({ render })
  app.mount(document.body.appendChild(document.createElement("div")))
  cleanups.push(() => app.unmount())
  await nextTick()
  // reka's Presence unmounts closed content a tick later.
  return async (fn: () => void) => { fn(); await nextTick(); await new Promise((r) => setTimeout(r, 20)) }
}
const $ = (sel: string) => document.querySelector<HTMLElement>(sel)!
const widths = () => $("[data-slot=sheet-content]").className.split(" ").filter((k) => k.startsWith("sm:max-w-"))

const sheet = {
  react: (content: object) => react(e(RS.Sheet, { open: true }, e(RS.SheetContent, content,
    e(RS.SheetHeader, null, e(RS.SheetTitle, null, "Fiche"), e(RS.SheetDescription, null, "D")),
    e(RS.SheetBody, null, "Corps"), e(RS.SheetFooter, null, "Pied")))),
  vue: (content: object) => vue(() => h(VS.Sheet, { open: true }, () => h(VS.SheetContent, content, () => [
    h(VS.SheetHeader, () => [h(VS.SheetTitle, () => "Fiche"), h(VS.SheetDescription, () => "D")]),
    h(VS.SheetBody, () => "Corps"), h(VS.SheetFooter, () => "Pied")]))),
}

describe.each(["react", "vue"] as const)("%s sheet", (fw) => {
  it.each([[undefined, "sm:max-w-sm"], ["md", "sm:max-w-xl"], ["lg", "sm:max-w-3xl"], ["xl", "sm:max-w-5xl"]])("size %s → %s", async (size, cls) => {
    await sheet[fw]({ size })
    expect(widths()).toEqual([cls])
  })
  it("scrolls the body between a fixed header and footer", async () => {
    await sheet[fw]({})
    expect($("[data-slot=sheet-body]").className).toMatch(/min-h-0/)
    expect($("[data-slot=sheet-body]").className).toMatch(/overflow-y-auto/)
    expect($("[data-slot=sheet-body]").className).toMatch(/flex-1/)
  })
})

const section = {
  react: (props: object) => react(e(RSection, { title: "Contacts", actions: e("button", { type: "button" }, "Ajouter un contact"), ...props }, e("p", null, "Liste des contacts"))),
  vue: (props: object) => vue(() => h(VSection, { title: "Contacts", ...props }, { default: () => h("p", "Liste des contacts"), actions: () => h("button", { type: "button" }, "Ajouter un contact") })),
}
const trigger = () => $("[data-slot=collapsible-section] h3 button")

describe.each(["react", "vue"] as const)("%s collapsible-section", (fw) => {
  it("titles the section with a heading that holds the toggle, actions beside it", async () => {
    await section[fw]({})
    expect(trigger().getAttribute("aria-expanded")).toBe("true")
    expect(trigger().textContent).toContain("Contacts")
    expect(trigger().textContent).not.toContain("Ajouter")
    expect(document.body.textContent).toContain("Liste des contacts")
  })
  it("toggles from the title, not from the actions", async () => {
    const onOpenChange = vi.fn()
    const run = await section[fw]({ onOpenChange })
    await run(() => [...document.querySelectorAll("button")].find((b) => b.textContent === "Ajouter un contact")!.click())
    expect(trigger().getAttribute("aria-expanded")).toBe("true")
    await run(() => trigger().click())
    expect(trigger().getAttribute("aria-expanded")).toBe("false")
    expect(document.body.textContent).not.toContain("Liste des contacts")
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
  it("starts closed with defaultOpen={false} and takes a heading level", async () => {
    await section[fw]({ defaultOpen: false, headingLevel: 2 })
    expect($("[data-slot=collapsible-section] h2 button").getAttribute("aria-expanded")).toBe("false")
  })
})
