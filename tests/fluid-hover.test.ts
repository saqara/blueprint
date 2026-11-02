// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vitest"

const animate = vi.fn()
vi.mock("motion", () => ({ animate }))
const { fluidHover: reactFluidHover } = await import("../registry/react/lib/fluid-hover")
const { fluidHover: vueFluidHover } = await import("../registry/vue/lib/fluid-hover")

afterEach(() => { animate.mockReset(); document.body.innerHTML = "" })

function list() {
  document.body.innerHTML = `<div id="c"><div id="h"></div><div class="item" id="a"></div><div class="item" id="b"></div></div>`
  return { c: document.getElementById("c")!, h: document.getElementById("h")!, a: document.getElementById("a")!, b: document.getElementById("b")! }
}
const lastTarget = () => animate.mock.calls[animate.mock.calls.length - 1][1]
const tick = () => new Promise((r) => setTimeout(r))

describe.each([["react", reactFluidHover], ["vue", vueFluidHover]])("%s fluidHover", (_, fluidHover) => {
  it("attribute mode follows the item the primitive marks active, and fades out when none is", async () => {
    const { h, b } = list()
    const stop = fluidHover(h, { mode: "attribute", items: ".item", active: "[data-highlighted]" })
    b.setAttribute("data-highlighted", "")
    await tick()
    expect(lastTarget()).toMatchObject({ opacity: 1 })
    b.removeAttribute("data-highlighted")
    await tick()
    expect(lastTarget()).toEqual({ opacity: 0 })
    stop()
  })

  it("pointer mode lights the item under the pointer and goes out on leave", () => {
    const { c, h, a } = list()
    const stop = fluidHover(h, { mode: "pointer", items: ".item" })
    a.dispatchEvent(new PointerEvent("pointermove", { bubbles: true }))
    expect(lastTarget()).toMatchObject({ opacity: 1 })
    c.dispatchEvent(new PointerEvent("pointerleave"))
    expect(lastTarget()).toEqual({ opacity: 0 })
    stop()
  })
})
