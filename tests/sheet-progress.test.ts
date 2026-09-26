// @vitest-environment happy-dom
import { act, createElement as e } from "react"
import { createRoot } from "react-dom/client"
import { createApp, h, nextTick } from "vue"
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest"
import * as RS from "../registry/react/ui/sheet"
import * as VS from "../registry/vue/ui/sheet"

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
// No layout in happy-dom: the body holds 1000px of content in a 400px window (600px scrollable).
const proto = HTMLElement.prototype
const saved = { sh: Object.getOwnPropertyDescriptor(proto, "scrollHeight"), ch: Object.getOwnPropertyDescriptor(proto, "clientHeight") }
beforeAll(() => {
  Object.defineProperty(proto, "scrollHeight", { configurable: true, get() { return this.dataset?.slot === "sheet-body" ? 1000 : 0 } })
  Object.defineProperty(proto, "clientHeight", { configurable: true, get() { return this.dataset?.slot === "sheet-body" ? 400 : 0 } })
})
afterAll(() => {
  if (saved.sh) Object.defineProperty(proto, "scrollHeight", saved.sh)
  if (saved.ch) Object.defineProperty(proto, "clientHeight", saved.ch)
})
const cleanups: (() => unknown)[] = []
afterEach(async () => {
  for (const c of cleanups.splice(0)) await c()
  document.body.innerHTML = ""
})
const body = () => document.querySelector<HTMLElement>("[data-slot=sheet-body]")!
const bar = () => document.querySelector<HTMLElement>("[data-slot=sheet-scroll-progress]")

describe.each([
  ["react", async (p: object) => {
    const root = createRoot(document.body.appendChild(document.createElement("div")))
    await act(async () => root.render(e(RS.Sheet, { open: true }, e(RS.SheetContent, null, e(RS.SheetTitle, null, "Fiche"), e(RS.SheetDescription, null, "D"), e(RS.SheetBody, p, "Corps")))))
    cleanups.push(() => act(async () => root.unmount()))
    return (fn: () => void) => act(async () => fn())
  }],
  ["vue", async (p: object) => {
    const app = createApp({ render: () => h(VS.Sheet, { open: true }, () => h(VS.SheetContent, () => [h(VS.SheetTitle, () => "Fiche"), h(VS.SheetDescription, () => "D"), h(VS.SheetBody, p, () => "Corps")])) })
    app.mount(document.body.appendChild(document.createElement("div")))
    cleanups.push(() => app.unmount())
    await nextTick()
    return async (fn: () => void) => { fn(); await nextTick() }
  }],
])("%s sheet scroll progress", (_, mount) => {
  it("shows a decorative bar that follows the scroll", async () => {
    const run = await mount({ scrollProgress: true })
    expect(bar()?.getAttribute("aria-hidden")).toBe("true")
    expect(bar()!.style.width).toBe("0%")
    await run(() => { body().scrollTop = 300; body().dispatchEvent(new Event("scroll")) })
    expect(bar()!.style.width).toBe("50%")
  })
  it("has no bar by default", async () => {
    await mount({})
    expect(bar()).toBeNull()
  })
})
