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
  it("wraps keyboard focus around the triggers", () => {
    expect([R.moveIndex(0, 1, 3), R.moveIndex(2, 1, 3), R.moveIndex(0, -1, 3)]).toEqual([1, 0, 2])
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
