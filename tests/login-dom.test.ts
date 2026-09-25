// @vitest-environment happy-dom
import { act, createElement as e } from "react"
import { createRoot } from "react-dom/client"
import { createApp, h, nextTick } from "vue"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { Login as RLogin } from "../registry/react/blocks/login"
import VLogin from "../registry/vue/blocks/Login.vue"

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
const cleanups: (() => unknown)[] = []
beforeEach(() => { vi.useFakeTimers() })
afterEach(async () => {
  for (const c of cleanups.splice(0)) await c()
  vi.useRealTimers()
  document.body.innerHTML = ""
})
const resend = () => [...document.querySelectorAll("button")].find((b) => b.textContent?.includes("Renvoyer"))!

describe.each([
  ["react", async (p: Record<string, unknown>) => {
    const root = createRoot(document.body.appendChild(document.createElement("div")))
    await act(async () => root.render(e(RLogin as any, p)))
    cleanups.push(() => act(async () => root.unmount()))
    return (fn: () => void) => act(async () => fn())
  }],
  ["vue", async (p: Record<string, unknown>) => {
    const app = createApp({ render: () => h(VLogin as any, p) })
    app.mount(document.body.appendChild(document.createElement("div")))
    cleanups.push(() => app.unmount())
    await nextTick()
    return async (fn: () => void) => { fn(); await nextTick() }
  }],
])("%s login resend", (_, mount) => {
  it("counts down, then resends and restarts the countdown", async () => {
    const onResend = vi.fn()
    const run = await mount({ password: false, magicLink: true, status: "sent", onResend, resendCooldown: 3 })
    expect(resend().disabled).toBe(true)
    await run(() => vi.advanceTimersByTime(1000))
    expect(resend().textContent).toMatch(/dans 2\s*s/)
    await run(() => vi.advanceTimersByTime(2000))
    expect(resend().disabled).toBe(false)
    await run(() => resend().click())
    expect(onResend).toHaveBeenCalledTimes(1)
    expect(resend().disabled).toBe(true)
    expect(resend().textContent).toMatch(/dans 3\s*s/)
  })
})
