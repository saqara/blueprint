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

  it("pointer mode waits a beat before a fresh hover, then follows at once, and goes out on leave", () => {
    vi.useFakeTimers()
    const { c, h, a, b } = list()
    const stop = fluidHover(h, { mode: "pointer", items: ".item" })
    const move = (el: Element) => el.dispatchEvent(new PointerEvent("pointermove", { bubbles: true }))
    move(a)
    c.dispatchEvent(new PointerEvent("pointerleave"))
    vi.advanceTimersByTime(100)
    expect(animate.mock.calls.some(([, t]) => t.opacity === 1)).toBe(false)
    move(a)
    vi.advanceTimersByTime(59)
    expect(animate.mock.calls.some(([, t]) => t.opacity === 1)).toBe(false)
    vi.advanceTimersByTime(1)
    expect(lastTarget()).toMatchObject({ opacity: 1 })
    const calls = animate.mock.calls.length
    move(b)
    expect(animate.mock.calls.length).toBeGreaterThan(calls)
    c.dispatchEvent(new PointerEvent("pointerleave"))
    expect(lastTarget()).toEqual({ opacity: 0 })
    stop()
    vi.useRealTimers()
  })
})

describe("hosts", () => {
  // The highlight is the container's first child: items must not rely on :first-child / :last-child.
  it.each(["registry/react/ui/toggle-group.tsx", "registry/vue/ui/toggle-group/ToggleGroupItem.vue"])("%s styles its ends by type", async (file) => {
    const src = (await import("node:fs")).readFileSync(file, "utf8")
    expect(src).toContain("first-of-type:rounded-l-md")
    expect(src).not.toMatch(/\]:(first|last):/)
  })
})
