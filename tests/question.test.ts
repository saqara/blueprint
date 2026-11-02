// @vitest-environment happy-dom
import { act, createElement as e } from "react"
import { createRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { createApp, createSSRApp, h, nextTick } from "vue"
import { renderToString as renderVue } from "vue/server-renderer"
import { afterEach, describe, expect, it, vi } from "vitest"
import { Question as RQuestion, type QuestionOption } from "../registry/react/ui/question"
import { Question as VQuestion } from "../registry/vue/ui/question"

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const options: QuestionOption[] = [
  { value: "a", label: "Carrelages du Sud-Ouest", description: "SAINT-VINCENT-DE-TYROSSE · Carrelage" },
  { value: "b", label: "Dupont & Fils", disabled: true },
  { value: "c", label: "SARL Dupont" },
]

type Handlers = { onSelect: (o: QuestionOption) => void; onOther: () => void; onClose: () => void }

const ssr = {
  react: (p: object) => renderToString(e(RQuestion, { options, onSelect: () => {}, ...p })),
  vue: (p: object) => renderVue(createSSRApp({ render: () => h(VQuestion, { options, ...p }) })),
}

describe.each(["react", "vue"] as const)("%s question (SSR)", (fw) => {
  it("is a listbox named by the question, with numbered options and their description", async () => {
    const html = await ssr[fw]({ question: "Quelle entreprise ?" })
    expect(html).toContain('role="listbox"')
    expect(html).toMatch(/<p id="([^"]+)-question"[^>]*>Quelle entreprise \?<\/p>[\s\S]*aria-labelledby="\1-question"/)
    expect(html).toContain("SAINT-VINCENT-DE-TYROSSE · Carrelage")
    expect(html.match(/role="option"/g)).toHaveLength(3)
    expect(html).toMatch(/aria-selected="true"[^>]*>(<!--[^>]*-->)*<span aria-hidden="true"[^>]*>1</)
  })
  it("shows « Autre réponse… » and a named close button only when handled", async () => {
    const bare = await ssr[fw]({ question: "Q" })
    expect(bare).not.toContain("Autre réponse…")
    expect(bare).not.toContain('aria-label="Fermer"')
    const full = await ssr[fw]({ question: "Q", onOther: () => {}, onClose: () => {} })
    expect(full).toContain("Autre réponse…")
    expect(full).toContain('aria-label="Fermer"')
  })
})

let cleanup: () => unknown = () => {}
afterEach(async () => { await cleanup(); document.body.innerHTML = "" })

async function mount(fw: "react" | "vue", handlers: Handlers) {
  const host = document.createElement("div")
  document.body.append(host)
  if (fw === "react") {
    const root = createRoot(host)
    await act(async () => root.render(e(RQuestion, { options, question: "Q", ...handlers })))
    cleanup = () => act(() => root.unmount())
  } else {
    const app = createApp({ render: () => h(VQuestion, { options, question: "Q", ...handlers }) })
    app.mount(host)
    await nextTick()
    // Vue skips an event stamped no later than its listener was attached (same millisecond as the mount here).
    await new Promise((resolve) => setTimeout(resolve, 2))
    cleanup = () => app.unmount()
  }
  return host
}
const key = async (fw: string, el: Element, k: string) => {
  const fire = () => el.dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true }))
  if (fw === "react") await act(async () => { fire() })
  else { fire(); await nextTick() }
}

describe.each(["react", "vue"] as const)("%s question (keyboard)", (fw) => {
  it("takes the focus, skips disabled options with the arrows, and picks with Enter", async () => {
    const onSelect = vi.fn()
    const host = await mount(fw, { onSelect, onOther: vi.fn(), onClose: vi.fn() })
    const list = host.querySelector('[role="listbox"]')!
    expect(document.activeElement).toBe(list)
    await key(fw, list, "ArrowDown")
    expect(host.querySelector('[aria-selected="true"]')?.textContent).toContain("SARL Dupont")
    await key(fw, list, "Enter")
    expect(onSelect).toHaveBeenCalledWith(options[2])
  })
  it("picks with a digit, ignores a disabled one, and closes on Escape", async () => {
    const onSelect = vi.fn(), onClose = vi.fn()
    const host = await mount(fw, { onSelect, onOther: vi.fn(), onClose })
    const list = host.querySelector('[role="listbox"]')!
    await key(fw, list, "2")
    expect(onSelect).not.toHaveBeenCalled()
    await key(fw, list, "1")
    expect(onSelect).toHaveBeenCalledWith(options[0])
    await key(fw, list, "Escape")
    expect(onClose).toHaveBeenCalledOnce()
  })
  it("hands back to the text field from « Autre réponse… »", async () => {
    const onOther = vi.fn()
    const host = await mount(fw, { onSelect: vi.fn(), onOther, onClose: vi.fn() })
    const other = [...host.querySelectorAll("button")].find((b) => b.textContent?.includes("Autre réponse…"))!
    if (fw === "react") await act(async () => other.click())
    else other.click()
    expect(onOther).toHaveBeenCalledOnce()
  })
})
