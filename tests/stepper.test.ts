import { createElement as e } from "react"
import { renderToString } from "react-dom/server"
import { createSSRApp, h } from "vue"
import { renderToString as renderVue } from "vue/server-renderer"
import { describe, expect, it } from "vitest"
import * as R from "../registry/react/ui/stepper"
import * as V from "../registry/vue/ui/stepper"

describe("react stepper logic", () => {
  it("derives the state of a step from the current value", () => {
    expect([1, 2, 3].map((s) => R.stepState(s, 2))).toEqual(["completed", "active", "inactive"])
    expect(R.stepState(3, 2, true)).toBe("completed")
  })
  it("moves keyboard focus without wrapping, like Reka (loop: false)", () => {
    expect([R.moveIndex(0, 1, 3), R.moveIndex(2, 1, 3), R.moveIndex(0, -1, 3)]).toEqual([1, 2, 0])
  })
  it("lets linear steppers reach up to the next step, like Reka", () => {
    expect([1, 2, 3].map((s) => R.isReachable(s, 1, true))).toEqual([true, true, false])
    expect(R.isReachable(3, 1, false)).toBe(true)
  })
  it("runs a consumer onClick before navigating, unless it prevents default", () => {
    const calls: string[] = []
    const nav = () => calls.push("navigate")
    R.composeHandlers<{ defaultPrevented: boolean }>(() => calls.push("consumer"), nav)({ defaultPrevented: false })
    R.composeHandlers<{ defaultPrevented: boolean }>(() => calls.push("consumer"), nav)({ defaultPrevented: true })
    expect(calls).toEqual(["consumer", "navigate", "consumer"])
  })
})

const states = (html: string) => [...html.matchAll(/data-state="(\w+)"/g)].map((m) => m[1])

describe("stepper parity", () => {
  it("renders completed, active, inactive for value 2 in both frameworks", async () => {
    const react = renderToString(
      e(R.Stepper, { value: 2 }, [1, 2, 3].map((step) =>
        e(R.StepperItem, { key: step, step }, e(R.StepperTrigger, null, e(R.StepperIndicator, null, step))))),
    )
    const vue = await renderVue(createSSRApp({
      render: () => h(V.Stepper, { modelValue: 2 }, () => [1, 2, 3].map((step) =>
        h(V.StepperItem, { key: step, step }, () => h(V.StepperTrigger, null, () => h(V.StepperIndicator, null, () => String(step)))))),
    }))
    expect(states(react)).toEqual(["completed", "active", "inactive"])
    expect(states(vue).filter((_, i, all) => all.length === 3 || i % 2 === 0).slice(0, 3)).toEqual(["completed", "active", "inactive"])
  })
})

const itemTags = (html: string) => [...html.matchAll(/<div[^>]*class="[^"]*\bgroup\b[^"]*"[^>]*>/g)].map((m) => m[0])

describe("stepper linear parity", () => {
  it("marks only unreachable steps as disabled in both frameworks (value 1)", async () => {
    const react = renderToString(
      e(R.Stepper, { value: 1 }, [1, 2, 3].map((step) =>
        e(R.StepperItem, { key: step, step }, e(R.StepperTrigger, null, String(step))))),
    )
    const vue = await renderVue(createSSRApp({
      render: () => h(V.Stepper, { modelValue: 1 }, () => [1, 2, 3].map((step) =>
        h(V.StepperItem, { key: step, step }, () => h(V.StepperTrigger, null, () => String(step))))),
    }))
    const disabled = (html: string) => itemTags(html).map((tag) => tag.includes("data-disabled"))
    expect(disabled(react)).toEqual([false, false, true])
    expect(disabled(vue)).toEqual([false, false, true])
    expect(react).toContain('role="group"')
  })
})
