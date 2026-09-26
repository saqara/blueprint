// @vitest-environment happy-dom
import { act, createElement as e } from "react"
import { createRoot } from "react-dom/client"
import { createApp, h, nextTick } from "vue"
import { afterEach, describe, expect, it, vi } from "vitest"
import * as R from "../registry/react/ui/radio-group"
import * as V from "../registry/vue/ui/radio-group"

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
const cleanups: (() => unknown)[] = []
afterEach(async () => {
  for (const c of cleanups.splice(0)) await c()
  document.body.innerHTML = ""
})
const radio = (v: string) => document.querySelector<HTMLElement>(`[role=radio][value=${v}]`)!

describe.each([
  ["react", async (p: Record<string, unknown>) => {
    const root = createRoot(document.body.appendChild(document.createElement("div")))
    await act(async () => root.render(e(R.RadioGroup, { defaultValue: "lyon", "aria-label": "Agence", ...p } as any,
      e(R.RadioGroupItem, { value: "lyon", "aria-label": "Lyon" }), e(R.RadioGroupItem, { value: "lille", "aria-label": "Lille" }))))
    cleanups.push(() => act(async () => root.unmount()))
    return (fn: () => void) => act(async () => fn())
  }],
  ["vue", async (p: Record<string, unknown>) => {
    const { onValueChange, ...rest } = p
    const app = createApp({ render: () => h(V.RadioGroup, { defaultValue: "lyon", "aria-label": "Agence", "onUpdate:modelValue": onValueChange, ...rest }, () => [
      h(V.RadioGroupItem, { value: "lyon", "aria-label": "Lyon" }), h(V.RadioGroupItem, { value: "lille", "aria-label": "Lille" })]) })
    app.mount(document.body.appendChild(document.createElement("div")))
    cleanups.push(() => app.unmount())
    await nextTick()
    return async (fn: () => void) => { fn(); await nextTick() }
  }],
])("%s radio-group allowDeselect", (_, mount) => {
  it("clears the selection when the checked item is clicked again", async () => {
    const onValueChange = vi.fn()
    const run = await mount({ allowDeselect: true, onValueChange })
    expect(radio("lyon").getAttribute("aria-checked")).toBe("true")
    await run(() => radio("lyon").click())
    expect(radio("lyon").getAttribute("aria-checked")).toBe("false")
    expect(onValueChange).toHaveBeenLastCalledWith("")
    await run(() => radio("lille").click())
    expect(radio("lille").getAttribute("aria-checked")).toBe("true")
  })
  it("keeps the selection without allowDeselect", async () => {
    const run = await mount({})
    await run(() => radio("lyon").click())
    expect(radio("lyon").getAttribute("aria-checked")).toBe("true")
  })
})
