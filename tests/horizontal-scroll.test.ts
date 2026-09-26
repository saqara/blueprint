// @vitest-environment happy-dom
import { act, createElement as e } from "react"
import { createRoot } from "react-dom/client"
import { createApp, h, nextTick } from "vue"
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest"
import { HorizontalScroll as RScroll } from "../registry/react/ui/horizontal-scroll"
import { HorizontalScroll as VScroll } from "../registry/vue/ui/horizontal-scroll"

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
// happy-dom has no layout: the viewport pretends to hold 2000px of content in 800px.
const proto = HTMLElement.prototype
const saved = { sw: Object.getOwnPropertyDescriptor(proto, "scrollWidth"), cw: Object.getOwnPropertyDescriptor(proto, "clientWidth") }
beforeAll(() => {
  Object.defineProperty(proto, "scrollWidth", { configurable: true, get() { return this.dataset?.slot === "horizontal-scroll-viewport" ? 2000 : 0 } })
  Object.defineProperty(proto, "clientWidth", { configurable: true, get() { return ["horizontal-scroll-viewport", "horizontal-scroll-bar"].includes(this.dataset?.slot) ? 800 : 0 } })
})
afterAll(() => {
  if (saved.sw) Object.defineProperty(proto, "scrollWidth", saved.sw)
  if (saved.cw) Object.defineProperty(proto, "clientWidth", saved.cw)
})
const cleanups: (() => unknown)[] = []
afterEach(async () => {
  for (const c of cleanups.splice(0)) await c()
  document.body.innerHTML = ""
})
const viewport = () => document.querySelector<HTMLElement>("[data-slot=horizontal-scroll-viewport]")!
const bar = () => document.querySelector<HTMLElement>("[data-slot=horizontal-scroll-bar]")

describe.each([
  ["react", async () => {
    const root = createRoot(document.body.appendChild(document.createElement("div")))
    await act(async () => root.render(e(RScroll, null, e("table", null, e("tbody", null, e("tr", null, e("td", null, "Très large")))))))
    cleanups.push(() => act(async () => root.unmount()))
    return (fn: () => void) => act(async () => fn())
  }],
  ["vue", async () => {
    const app = createApp({ render: () => h(VScroll, null, () => h("table", h("tbody", h("tr", h("td", "Très large"))))) })
    app.mount(document.body.appendChild(document.createElement("div")))
    cleanups.push(() => app.unmount())
    await nextTick(); await nextTick()
    return async (fn: () => void) => { fn(); await nextTick() }
  }],
])("%s horizontal-scroll", (_, mount) => {
  it("shows a sticky bar whose thumb follows the content, and drags it", async () => {
    const run = await mount()
    expect(bar()).not.toBeNull()
    expect(bar()!.className).toMatch(/sticky/)
    const thumb = () => bar()!.querySelector<HTMLElement>("[data-slot=horizontal-scroll-thumb]")!
    // 800 of 2000px visible: the thumb is 40% of the 800px track.
    expect(thumb().style.width).toBe("320px")
    await run(() => { viewport().scrollLeft = 300; viewport().dispatchEvent(new Event("scroll")) })
    // 300 of 1200px scrollable -> 25% of the 480px free track.
    expect(thumb().style.left).toBe("120px")
    const pointer = (el: HTMLElement, type: string, x: number) => el.dispatchEvent(new PointerEvent(type, { clientX: x, button: 0, pointerType: "mouse", bubbles: true }))
    await run(() => pointer(thumb(), "pointerdown", 0))
    await run(() => pointer(thumb(), "pointermove", 48))
    // 48px of thumb = 48 * 1200 / 480 = 120px of content.
    expect(viewport().scrollLeft).toBe(420)
    await run(() => pointer(thumb(), "pointerup", 48))
  })
  it("drags the content with the mouse", async () => {
    const run = await mount()
    const pointer = (type: string, x: number) => viewport().dispatchEvent(new PointerEvent(type, { clientX: x, button: 0, pointerType: "mouse", bubbles: true }))
    await run(() => { viewport().scrollLeft = 200; pointer("pointerdown", 500) })
    await run(() => pointer("pointermove", 400))
    expect(viewport().scrollLeft).toBe(300)
    await run(() => pointer("pointerup", 400))
    await run(() => pointer("pointermove", 300))
    expect(viewport().scrollLeft).toBe(300)
  })
})

describe.each([
  ["react", async (props: Record<string, unknown>, onRow: () => void) => {
    const root = createRoot(document.body.appendChild(document.createElement("div")))
    await act(async () => root.render(e(RScroll, props as any, e("table", null, e("tbody", null, e("tr", { onClick: onRow }, e("td", null, "Bâti Sud")))))))
    cleanups.push(() => act(async () => root.unmount()))
    return (fn: () => void) => act(async () => fn())
  }],
  ["vue", async (props: Record<string, unknown>, onRow: () => void) => {
    const app = createApp({ render: () => h(VScroll, props, () => h("table", h("tbody", h("tr", { onClick: onRow }, h("td", "Bâti Sud"))))) })
    app.mount(document.body.appendChild(document.createElement("div")))
    cleanups.push(() => app.unmount())
    await nextTick(); await nextTick()
    return async (fn: () => void) => { fn(); await nextTick() }
  }],
])("%s horizontal-scroll clicks", (_, mount) => {
  const pointer = (type: string, x: number) => viewport().dispatchEvent(new PointerEvent(type, { clientX: x, button: 0, pointerType: "mouse", bubbles: true }))
  const td = () => document.querySelector<HTMLElement>("td")!
  it("lets a plain click reach the row (no pointer capture before a real drag)", async () => {
    const capture = vi.spyOn(HTMLElement.prototype, "setPointerCapture").mockImplementation(() => {})
    let rows = 0
    const run = await mount({}, () => {})
    // A native listener: the test is about where the click lands, not about the framework's own handler timing.
    td().closest("tr")!.addEventListener("click", () => rows++)
    await run(() => { pointer("pointerdown", 500); pointer("pointerup", 501); td().click() })
    expect(capture).not.toHaveBeenCalled()
    expect(rows).toBe(1)
    // A real drag (> 5px) captures the pointer and swallows the click that follows.
    await run(() => { pointer("pointerdown", 500); pointer("pointermove", 450); pointer("pointerup", 450); td().click() })
    expect(capture).toHaveBeenCalled()
    expect(rows).toBe(1)
    await run(() => td().click())
    expect(rows).toBe(2)
    capture.mockRestore()
  })
  it("exposes the viewport (viewportRef / viewportProps)", async () => {
    const box: { current: HTMLElement | null } = { current: null }
    await mount({ viewportRef: (el: HTMLElement | null) => { box.current = el }, viewportProps: { className: "max-h-full", class: "max-h-full", "data-testid": "annuaire-scroll" } }, () => {})
    expect(viewport().className).toContain("max-h-full")
    expect(viewport().dataset.testid).toBe("annuaire-scroll")
    expect(box.current).toBe(viewport())
  })
})

describe("horizontal-scroll vertical scrolling", () => {
  it.each(["react", "vue"] as const)("%s: hides only the horizontal native bar when the content also scrolls vertically", async (fw) => {
    const sh = Object.getOwnPropertyDescriptor(proto, "scrollHeight")
    const ch = Object.getOwnPropertyDescriptor(proto, "clientHeight")
    Object.defineProperty(proto, "scrollHeight", { configurable: true, get() { return this.dataset?.slot === "horizontal-scroll-viewport" ? 1500 : 0 } })
    Object.defineProperty(proto, "clientHeight", { configurable: true, get() { return this.dataset?.slot === "horizontal-scroll-viewport" ? 400 : 0 } })
    try {
      if (fw === "react") {
        const root = createRoot(document.body.appendChild(document.createElement("div")))
        await act(async () => root.render(e(RScroll, null, e("div", null, "x"))))
        cleanups.push(() => act(async () => root.unmount()))
      } else {
        const app = createApp({ render: () => h(VScroll, null, () => h("div", "x")) })
        app.mount(document.body.appendChild(document.createElement("div")))
        cleanups.push(() => app.unmount())
        await nextTick(); await nextTick()
      }
      expect(viewport().className).toContain("[&::-webkit-scrollbar:horizontal]:h-0")
      expect(viewport().className).not.toContain("[scrollbar-width:none]")
      expect(bar()!.className).toContain("shrink-0")
    } finally {
      if (sh) Object.defineProperty(proto, "scrollHeight", sh); else delete (proto as any).scrollHeight
      if (ch) Object.defineProperty(proto, "clientHeight", ch); else delete (proto as any).clientHeight
    }
  })
})

