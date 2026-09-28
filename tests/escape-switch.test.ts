// @vitest-environment happy-dom
import { act, createElement as e } from "react"
import { createRoot } from "react-dom/client"
import { createApp, h, nextTick } from "vue"
import { readFileSync } from "node:fs"
import { afterEach, describe, expect, it } from "vitest"
import * as RD from "../registry/react/ui/dialog"
import * as VD from "../registry/vue/ui/dialog"
import { Autocomplete as RAuto } from "../registry/react/ui/autocomplete"
import { Autocomplete as VAuto } from "../registry/vue/ui/autocomplete"
import { contrastRatio, type Tokens } from "../scripts/lib/contrast.ts"

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
const cleanups: (() => unknown)[] = []
afterEach(async () => {
  for (const c of cleanups.splice(0)) await c()
  document.body.innerHTML = ""
})
const tick = () => new Promise((r) => setTimeout(r, 20))
const suggestions = [{ value: "lyon", label: "Agence de Lyon" }]
const input = () => document.querySelector<HTMLInputElement>("[role=combobox]")!
const escape = () => input().dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }))

describe.each([
  ["react", async () => {
    const root = createRoot(document.body.appendChild(document.createElement("div")))
    await act(async () => root.render(e(RD.Dialog, { defaultOpen: true }, e(RD.DialogContent, null, e(RD.DialogTitle, null, "Inviter"), e(RD.DialogDescription, null, "D"),
      e(RAuto, { value: "Ag", suggestions, "aria-label": "Agence principale" })))))
    cleanups.push(() => act(async () => root.unmount()))
    return async (fn: () => void) => { await act(async () => { fn(); await tick() }) }
  }],
  ["vue", async () => {
    const app = createApp({ render: () => h(VD.Dialog, { defaultOpen: true }, () => h(VD.DialogContent, () => [h(VD.DialogTitle, () => "Inviter"), h(VD.DialogDescription, () => "D"),
      h(VAuto, { value: "Ag", suggestions, "aria-label": "Agence principale" })])) })
    app.mount(document.body.appendChild(document.createElement("div")))
    cleanups.push(() => app.unmount())
    await nextTick(); await tick()
    return async (fn: () => void) => { fn(); await nextTick(); await tick() }
  }],
])("%s autocomplete in a dialog", (_, mount) => {
  it("closes its list on the first Escape, the dialog on the second", async () => {
    const run = await mount()
    await run(() => input().focus())
    expect(document.querySelectorAll("[role=option]")).toHaveLength(1)
    await run(escape)
    expect(document.querySelector("[role=option]")).toBeNull()
    expect(document.querySelector("[role=dialog]")).not.toBeNull()
    await run(escape)
    expect(document.querySelector("[role=dialog]")).toBeNull()
  })
})

describe("switch unchecked track", () => {
  const t: Tokens = JSON.parse(readFileSync("tokens/theme.json", "utf8"))
  const tint = (color: string, surface: string, alpha: number) => "#" + [1, 3, 5].map((i) =>
    Math.round(parseInt(color.slice(i, i + 2), 16) * alpha + parseInt(surface.slice(i, i + 2), 16) * (1 - alpha)).toString(16).padStart(2, "0")).join("")
  it.each(["registry/react/ui/switch.tsx", "registry/vue/ui/switch/Switch.vue"])("%s uses muted-foreground/70", (file) => {
    const src = readFileSync(file, "utf8")
    expect(src).toContain("data-[state=unchecked]:bg-muted-foreground/70")
    expect(src).not.toMatch(/data-\[state=unchecked\]:bg-input/)
  })
  it.each(["light", "dark"] as const)("reaches 3:1 against the page and cards (WCAG 1.4.11), %s", (mode) => {
    const v = t[mode]
    for (const surface of [v.background, v.card]) expect(contrastRatio(tint(v["muted-foreground"], surface, 0.7), surface)).toBeGreaterThanOrEqual(3)
  })
})
