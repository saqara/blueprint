// @vitest-environment happy-dom
import { act, createElement as e, type ReactNode } from "react"
import { createRoot } from "react-dom/client"
import { createApp, h, nextTick, ref, type Component } from "vue"
import { afterEach, describe, expect, it } from "vitest"
import * as RD from "../registry/react/ui/dialog"
import * as RS from "../registry/react/ui/sheet"
import * as RA from "../registry/react/ui/alert-dialog"
import * as VD from "../registry/vue/ui/dialog"
import * as VS from "../registry/vue/ui/sheet"
import * as VA from "../registry/vue/ui/alert-dialog"

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
const tick = () => new Promise((r) => setTimeout(r, 20))
const $ = (sel: string) => document.querySelector<HTMLElement>(sel)!

afterEach(() => {
  document.body.innerHTML = ""
})

function opener() {
  const b = document.createElement("button")
  b.textContent = "Ouvrir"
  document.body.append(b)
  b.focus()
  return b
}

// Controlled, no Trigger: pfou opens dialogs from table rows and menus.
function renderReact(tree: (open: boolean) => ReactNode) {
  const host = document.body.appendChild(document.createElement("div"))
  const root = createRoot(host)
  return {
    set: (open: boolean) => act(async () => root.render(tree(open))),
  }
}

function renderVue(tree: () => ReturnType<typeof h>) {
  const host = document.body.appendChild(document.createElement("div"))
  createApp({ render: tree }).mount(host)
}

describe("react dialog", () => {
  const dialog = (open: boolean, content: object = {}, footer: object = {}) =>
    e(RD.Dialog, { open }, e(RD.DialogContent, content,
      e(RD.DialogHeader, null, e(RD.DialogTitle, null, "Titre"), e(RD.DialogDescription, null, "Desc")),
      e(RD.DialogBody, null, "Corps"),
      e(RD.DialogFooter, { showCloseButton: true, ...footer })))

  it("speaks French by default and takes a closeLabel", async () => {
    const r = renderReact((o) => dialog(o))
    await r.set(true)
    expect($("[data-slot=dialog-content] > [data-slot=dialog-close] .sr-only").textContent).toBe("Fermer")
    expect($("[data-slot=dialog-footer] button").textContent).toBe("Fermer")
    const r2 = renderReact((o) => dialog(o, { closeLabel: "Annuler" }, { closeLabel: "Annuler" }))
    await r2.set(true)
    expect(document.body.textContent).toContain("Annuler")
  })

  it("caps its height and scrolls the body between header and footer", async () => {
    const r = renderReact((o) => dialog(o))
    await r.set(true)
    expect($("[data-slot=dialog-content]").className).toContain("max-h-[calc(100dvh-2rem)]")
    expect($("[data-slot=dialog-body]").className).toMatch(/min-h-0.*overflow-y-auto|overflow-y-auto.*min-h-0/)
  })

  it.each([
    [undefined, "sm:max-w-lg"],
    ["sm", "sm:max-w-md"],
    ["md", "sm:max-w-2xl"],
    ["lg", "sm:max-w-4xl"],
    ["xl", "sm:max-w-6xl"],
  ])("size %s → %s", async (size, cls) => {
    const r = renderReact((o) => dialog(o, { size }))
    await r.set(true)
    const c = $("[data-slot=dialog-content]").className.split(" ")
    expect(c).toContain(cls)
    expect(c.filter((k) => k.startsWith("sm:max-w-"))).toEqual([cls])
  })

  it("lets className override the size width", async () => {
    const r = renderReact((o) => dialog(o, { size: "lg", className: "sm:max-w-xl" }))
    await r.set(true)
    expect($("[data-slot=dialog-content]").className.split(" ").filter((k) => k.startsWith("sm:max-w-"))).toEqual(["sm:max-w-xl"])
  })
})

describe("react focus return (controlled, no trigger)", () => {
  const cases: [string, (open: boolean) => ReactNode][] = [
    ["dialog", (open) => e(RD.Dialog, { open }, e(RD.DialogContent, null, e(RD.DialogTitle, null, "T"), e(RD.DialogDescription, null, "D")))],
    ["sheet", (open) => e(RS.Sheet, { open }, e(RS.SheetContent, null, e(RS.SheetTitle, null, "T"), e(RS.SheetDescription, null, "D")))],
    ["alert-dialog", (open) => e(RA.AlertDialog, { open }, e(RA.AlertDialogContent, null, e(RA.AlertDialogTitle, null, "T"), e(RA.AlertDialogDescription, null, "D"), e(RA.AlertDialogCancel, null, "Annuler")))],
  ]
  it.each(cases)("%s refocuses its opener on close", async (_, tree) => {
    const b = opener()
    const r = renderReact(tree)
    await r.set(true)
    await tick()
    expect(document.activeElement).not.toBe(b)
    await r.set(false)
    await tick()
    expect(document.activeElement).toBe(b)
  })
})

describe("vue dialog", () => {
  const dialog = (content: object = {}, footer: object = {}, Content: Component = VD.DialogContent) => () =>
    h(VD.Dialog, { open: true }, () => h(Content, content, () => [
      h(VD.DialogHeader, () => [h(VD.DialogTitle, () => "Titre"), h(VD.DialogDescription, () => "Desc")]),
      h(VD.DialogBody, () => "Corps"),
      h(VD.DialogFooter, { showCloseButton: true, ...footer }),
    ]))

  it.each([["DialogContent", VD.DialogContent], ["DialogScrollContent", VD.DialogScrollContent]])("%s speaks French by default", async (_, Content) => {
    renderVue(dialog({}, {}, Content))
    await nextTick()
    expect($("[role=dialog] > button .sr-only").textContent).toBe("Fermer")
    expect($("[data-slot=dialog-footer] button").textContent?.trim()).toBe("Fermer")
  })

  it("takes a closeLabel", async () => {
    renderVue(dialog({ closeLabel: "Annuler" }, { closeLabel: "Annuler" }))
    await nextTick()
    expect($("[role=dialog] > button .sr-only").textContent).toBe("Annuler")
    expect($("[data-slot=dialog-footer] button").textContent?.trim()).toBe("Annuler")
  })

  it("caps its height and scrolls the body between header and footer", async () => {
    renderVue(dialog())
    await nextTick()
    expect($("[data-slot=dialog-content]").className).toContain("max-h-[calc(100dvh-2rem)]")
    expect($("[data-slot=dialog-body]").className).toMatch(/min-h-0.*overflow-y-auto|overflow-y-auto.*min-h-0/)
  })

  it.each([
    [undefined, "sm:max-w-lg"],
    ["sm", "sm:max-w-md"],
    ["md", "sm:max-w-2xl"],
    ["lg", "sm:max-w-4xl"],
    ["xl", "sm:max-w-6xl"],
  ])("size %s → %s", async (size, cls) => {
    renderVue(dialog({ size }))
    await nextTick()
    const c = $("[data-slot=dialog-content]").className.split(" ")
    expect(c.filter((k) => k.startsWith("sm:max-w-"))).toEqual([cls])
  })
})

describe("vue focus return (controlled, no trigger)", () => {
  const cases: [string, (open: boolean) => ReturnType<typeof h>][] = [
    ["dialog", (open) => h(VD.Dialog, { open }, () => h(VD.DialogContent, () => [h(VD.DialogTitle, () => "T"), h(VD.DialogDescription, () => "D")]))],
    ["dialog scroll", (open) => h(VD.Dialog, { open }, () => h(VD.DialogScrollContent, () => [h(VD.DialogTitle, () => "T"), h(VD.DialogDescription, () => "D")]))],
    ["sheet", (open) => h(VS.Sheet, { open }, () => h(VS.SheetContent, () => [h(VS.SheetTitle, () => "T"), h(VS.SheetDescription, () => "D")]))],
    ["alert-dialog", (open) => h(VA.AlertDialog, { open }, () => h(VA.AlertDialogContent, () => [h(VA.AlertDialogTitle, () => "T"), h(VA.AlertDialogDescription, () => "D"), h(VA.AlertDialogCancel, () => "Annuler")]))],
  ]
  it.each(cases)("%s refocuses its opener on close", async (_, tree) => {
    const b = opener()
    const open = ref(true)
    renderVue(() => tree(open.value))
    await nextTick()
    await tick()
    expect(document.activeElement).not.toBe(b)
    open.value = false
    await nextTick()
    await tick()
    expect(document.activeElement).toBe(b)
  })
})
