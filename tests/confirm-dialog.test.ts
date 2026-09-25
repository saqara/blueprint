// @vitest-environment happy-dom
import { act, createElement as e } from "react"
import { createRoot } from "react-dom/client"
import { createApp, h, nextTick } from "vue"
import { afterEach, describe, expect, it } from "vitest"
import * as R from "../registry/react/ui/confirm-dialog"
import * as V from "../registry/vue/ui/confirm-dialog"
import * as VA from "../registry/vue/ui/alert-dialog"

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
const tick = () => new Promise((r) => setTimeout(r, 20))
const dialog = () => document.querySelector<HTMLElement>("[role=alertdialog]")
const button = (text: string) => [...document.querySelectorAll("button")].find((b) => b.textContent?.trim() === text)!

// The store is a module singleton: unmount every dialog, or old ones render again.
const cleanups: (() => unknown)[] = []
afterEach(async () => {
  for (const c of cleanups.splice(0)) await c()
  document.body.innerHTML = ""
})

type Api = { confirm: typeof R.confirm; flush: () => Promise<void>; click: (text: string) => Promise<void> }

const react: () => Promise<Api> = async () => {
  const root = createRoot(document.body.appendChild(document.createElement("div")))
  await act(async () => root.render(e(R.ConfirmDialog)))
  cleanups.push(() => act(async () => root.unmount()))
  const flush = () => act(async () => { await tick() })
  return {
    confirm: (o) => { let p!: Promise<boolean>; act(() => { p = R.confirm(o) }); return p },
    flush,
    click: async (text) => { await act(async () => button(text).click()); await flush() },
  }
}

const vue: () => Promise<Api> = async () => {
  const app = createApp({ render: () => h(V.ConfirmDialog) })
  app.mount(document.body.appendChild(document.createElement("div")))
  cleanups.push(() => app.unmount())
  const flush = async () => { await nextTick(); await tick() }
  return { confirm: V.confirm, flush, click: async (text) => { button(text).click(); await flush() } }
}

describe.each([["react", react], ["vue", vue]])("%s confirm()", (_, mount) => {
  it("speaks French by default and resolves true on confirm", async () => {
    const ui = await mount()
    const answer = ui.confirm({ message: "Supprimer ce contact ?" })
    await ui.flush()
    expect(dialog()!.textContent).toContain("Confirmation")
    expect(dialog()!.textContent).toContain("Supprimer ce contact ?")
    expect(button("Annuler")).toBeTruthy()
    await ui.click("Confirmer")
    await expect(answer).resolves.toBe(true)
    expect(dialog()).toBeNull()
  })

  it("resolves false on cancel, with custom texts", async () => {
    const ui = await mount()
    const answer = ui.confirm({ title: "Archiver", message: "Sûr ?", confirmText: "Archiver", cancelText: "Non" })
    await ui.flush()
    await ui.click("Non")
    await expect(answer).resolves.toBe(false)
  })

  it("settles a replaced confirm with false", async () => {
    const ui = await mount()
    const first = ui.confirm({ message: "Premier" })
    await ui.flush()
    const second = ui.confirm({ message: "Second" })
    await ui.flush()
    await expect(first).resolves.toBe(false)
    expect(dialog()!.textContent).toContain("Second")
    await ui.click("Confirmer")
    await expect(second).resolves.toBe(true)
  })

  it("stays open and busy while onConfirm runs", async () => {
    const ui = await mount()
    let finish!: () => void
    const answer = ui.confirm({ message: "Envoyer ?", onConfirm: () => new Promise<void>((r) => { finish = r }) })
    await ui.flush()
    await ui.click("Confirmer")
    expect(dialog()).not.toBeNull()
    expect(button("Confirmer").getAttribute("aria-busy")).toBe("true")
    expect(button("Annuler").disabled).toBe(true)
    finish()
    await ui.flush()
    await expect(answer).resolves.toBe(true)
    expect(dialog()).toBeNull()
  })

  it("rejects with onConfirm's error and closes", async () => {
    const ui = await mount()
    const answer = ui.confirm({ message: "Envoyer ?", onConfirm: async () => { throw new Error("réseau") } })
    const settled = answer.catch((err: Error) => err.message)
    await ui.flush()
    await ui.click("Confirmer")
    expect(await settled).toBe("réseau")
    expect(dialog()).toBeNull()
  })

  it("uses a destructive action for destructive confirms", async () => {
    const ui = await mount()
    ui.confirm({ message: "Supprimer ?", variant: "destructive" })
    await ui.flush()
    expect(button("Confirmer").className).toContain("bg-destructive")
    expect(document.querySelector("[data-slot=alert-dialog-media]")).not.toBeNull()
  })
})

describe("vue alert-dialog parity", () => {
  it("has size and media like React", async () => {
    createApp({
      render: () => h(VA.AlertDialog, { open: true }, () => h(VA.AlertDialogContent, { size: "sm" }, () => [
        h(VA.AlertDialogHeader, () => [h(VA.AlertDialogMedia, () => "!"), h(VA.AlertDialogTitle, () => "T"), h(VA.AlertDialogDescription, () => "D")]),
      ])),
    }).mount(document.body.appendChild(document.createElement("div")))
    await nextTick()
    expect(dialog()!.dataset.size).toBe("sm")
    expect(document.querySelector("[data-slot=alert-dialog-media]")).not.toBeNull()
  })
})
