// @vitest-environment happy-dom
import { act, createElement as e } from "react"
import { createRoot } from "react-dom/client"
import { createApp, h, nextTick, ref } from "vue"
import { afterEach, describe, expect, it, vi } from "vitest"
import * as R from "../registry/react/ui/select"
import * as V from "../registry/vue/ui/select"

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
const cleanups: (() => unknown)[] = []
afterEach(async () => {
  for (const c of cleanups.splice(0)) await c()
  document.body.innerHTML = ""
})

// Regression (pfou-hub): inside a <form>, a value set before its options must not be echoed back as "".
describe("select value set before its options", () => {
  it("react: never calls onValueChange with an empty echo", async () => {
    const onValueChange = vi.fn()
    const root = createRoot(document.body.appendChild(document.createElement("div")))
    cleanups.push(() => act(async () => root.unmount()))
    const tree = (value: string | undefined, items: string[]) => e("form", null, e(R.Select, { name: "poste", value, onValueChange },
      e(R.SelectTrigger, { "aria-label": "Poste" }, e(R.SelectValue)),
      e(R.SelectContent, null, items.map((v) => e(R.SelectItem, { key: v, value: v }, v)))))
    // The profile loads first (value arrives), the list of positions after.
    await act(async () => root.render(tree(undefined, [])))
    await act(async () => root.render(tree("tech", [])))
    await act(async () => root.render(tree("tech", ["tech", "admin"])))
    expect(onValueChange).not.toHaveBeenCalledWith("")
  })
  it("vue: never emits an empty echo", async () => {
    const onUpdate = vi.fn()
    const items = ref<string[]>([])
    const value = ref<string>()
    const app = createApp({ render: () => h("form", h(V.Select, { name: "poste", modelValue: value.value, "onUpdate:modelValue": onUpdate }, () => [
      h(V.SelectTrigger, { "aria-label": "Poste" }, () => h(V.SelectValue)),
      h(V.SelectContent, () => items.value.map((v) => h(V.SelectItem, { key: v, value: v }, () => v))),
    ])) })
    app.mount(document.body.appendChild(document.createElement("div")))
    cleanups.push(() => app.unmount())
    await nextTick()
    value.value = "tech"
    await nextTick(); await nextTick()
    items.value = ["tech", "admin"]
    await nextTick(); await nextTick()
    expect(onUpdate).not.toHaveBeenCalledWith("")
  })
})
