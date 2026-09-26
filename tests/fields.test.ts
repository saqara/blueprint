// @vitest-environment happy-dom
import { act, createElement as e } from "react"
import { createRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { createApp, createSSRApp, h, nextTick } from "vue"
import { renderToString as renderVue } from "vue/server-renderer"
import { afterEach, describe, expect, it } from "vitest"
import { Input as RInput } from "../registry/react/ui/input"
import { Input as VInput } from "../registry/vue/ui/input"
import { Textarea as RTextarea } from "../registry/react/ui/textarea"
import { Textarea as VTextarea } from "../registry/vue/ui/textarea"
import * as RS from "../registry/react/ui/select"
import * as VS from "../registry/vue/ui/select"
import { PasswordInput as RPassword } from "../registry/react/ui/password-input"
import { PasswordInput as VPassword } from "../registry/vue/ui/password-input"

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
const cleanups: (() => unknown)[] = []
afterEach(async () => {
  for (const c of cleanups.splice(0)) await c()
  document.body.innerHTML = ""
})
const vue = (node: () => ReturnType<typeof h>) => renderVue(createSSRApp({ render: node }))
const decode = (s: string) => s.replace(/&amp;/g, "&")

describe("read-only fields stay legible", () => {
  it.each([
    ["react input", async () => renderToString(e(RInput, { readOnly: true, value: "Simon" }))],
    ["vue input", async () => vue(() => h(VInput, { readonly: true, modelValue: "Simon" }))],
    ["react textarea", async () => renderToString(e(RTextarea, { readOnly: true, value: "Note" }))],
    ["vue textarea", async () => vue(() => h(VTextarea, { readonly: true, modelValue: "Note" }))],
  ])("%s: muted background, no fading", async (_, render) => {
    const html = decode(await render())
    expect(html).toContain("readonly")
    expect(html).toContain("[&[readonly]]:bg-muted/40")
  })
  it.each([
    ["react", async () => renderToString(e(RS.Select, { value: "tech" }, e(RS.SelectTrigger, { readOnly: true, "aria-label": "Poste" }, e(RS.SelectValue, { placeholder: "—" }))))],
    ["vue", async () => vue(() => h(VS.Select, { modelValue: "tech" }, () => h(VS.SelectTrigger, { readOnly: true, "aria-label": "Poste" }, () => h(VS.SelectValue, { placeholder: "—" }))))],
  ])("%s select trigger readOnly: cannot open, no chevron, legible", async (_, render) => {
    const html = decode(await render())
    expect(html).toMatch(/data-readonly/)
    expect(html).toMatch(/<button[^>]*\sdisabled/)
    expect(html).toContain("data-[readonly]:opacity-100")
    expect(html).not.toContain("lucide-chevron-down")
  })
})

describe.each([
  ["react", async () => {
    const root = createRoot(document.body.appendChild(document.createElement("div")))
    await act(async () => root.render(e(RPassword, { "aria-label": "Clé d'API", defaultValue: "secret" })))
    cleanups.push(() => act(async () => root.unmount()))
    return (fn: () => void) => act(async () => fn())
  }],
  ["vue", async () => {
    const app = createApp({ render: () => h(VPassword, { "aria-label": "Clé d'API", modelValue: "secret" }) })
    app.mount(document.body.appendChild(document.createElement("div")))
    cleanups.push(() => app.unmount())
    await nextTick()
    return async (fn: () => void) => { fn(); await nextTick() }
  }],
])("%s password-input", (_, mount) => {
  it("reveals and hides the value with a labelled toggle", async () => {
    const run = await mount()
    const input = () => document.querySelector("input")!
    const toggle = () => document.querySelector<HTMLButtonElement>("[data-slot=input-group] button")!
    expect(input().type).toBe("password")
    expect(toggle().getAttribute("aria-label")).toBe("Afficher le mot de passe")
    expect(toggle().getAttribute("aria-pressed")).toBe("false")
    await run(() => toggle().click())
    expect(input().type).toBe("text")
    expect(toggle().getAttribute("aria-label")).toBe("Masquer le mot de passe")
    expect(toggle().getAttribute("aria-pressed")).toBe("true")
  })
})
