// @vitest-environment happy-dom
import { act, createElement as e } from "react"
import { createRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { createApp, createSSRApp, h, nextTick } from "vue"
import { renderToString as renderVue } from "vue/server-renderer"
import { afterEach, describe, expect, it, vi } from "vitest"
import { Wizard as RWizard } from "../registry/react/blocks/wizard"
import VWizard from "../registry/vue/blocks/Wizard.vue"
import VDemo from "../src/vue/demos/wizard.vue"

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
const cleanups: (() => unknown)[] = []
afterEach(async () => {
  for (const c of cleanups.splice(0)) await c()
  document.body.innerHTML = ""
})

const steps = [{ title: "Entreprise", description: "SIREN" }, { title: "Contact" }]
const reactProps = (p: Record<string, unknown>) => ({
  steps: steps.map((s, i) => ({ ...s, content: e("p", null, `contenu ${i + 1}`) })), review: e("p", null, "relecture"), ...p,
})
const vueSlots = { "step-1": () => h("p", "contenu 1"), "step-2": () => h("p", "contenu 2"), review: () => h("p", "relecture"), done: () => h("p", "bravo") }

describe.each([
  ["react", (p: Record<string, unknown>) => renderToString(e(RWizard as any, reactProps(p)))],
  ["vue", (p: Record<string, unknown>) => renderVue(createSSRApp({ render: () => h(VWizard as any, { steps, ...p }, vueSlots) }))],
] as const)("%s wizard render", (_, render) => {
  it("shows the first step, its position and a review step at the end", async () => {
    const html = await render({ title: "Créer votre compte" })
    expect(html).toMatch(/<h1[^>]*>Créer votre compte<\/h1>/)
    expect(html).toMatch(/Étape (<!--[^>]*-->)?1(<!--[^>]*-->)? sur (<!--[^>]*-->)?3/)
    expect(html).toContain("contenu 1")
    expect(html).toContain("Récapitulatif")
    expect(html).not.toContain("contenu 2")
  })
  it("replaces the form once done", async () => {
    const html = await render({ status: "done", doneTitle: "Compte créé", done: e("p", null, "bravo") })
    expect(html).toMatch(/<h1[^>]*>Compte créé<\/h1>/)
    expect(html).toContain("bravo")
    expect(html).not.toContain("Suivant")
  })
})

describe("vue wizard with template slots", () => {
  it("swaps the step content (compiled slots are stable: the outlet is keyed on the step)", async () => {
    const app = createApp({ render: () => h(VDemo) })
    app.mount(document.body.appendChild(document.createElement("div")))
    cleanups.push(() => app.unmount())
    await nextTick()
    for (const [id, value] of [["wizard-siren", "732829320"], ["wizard-name", "Acme"]]) {
      const input = document.getElementById(id) as HTMLInputElement
      input.value = value
      input.dispatchEvent(new Event("input"))
    }
    await nextTick()
    button("Suivant").click()
    await nextTick()
    await nextTick()
    expect(document.getElementById("wizard-contact")).not.toBeNull()
    expect(document.getElementById("wizard-siren")).toBeNull()
  })
})

const button = (label: string) => [...document.querySelectorAll("button")].find((b) => b.textContent?.trim() === label)!

describe.each([
  ["react", async (p: Record<string, unknown>) => {
    const root = createRoot(document.body.appendChild(document.createElement("div")))
    await act(async () => root.render(e(RWizard as any, reactProps(p))))
    cleanups.push(() => act(async () => root.unmount()))
    return (fn: () => void) => act(async () => fn())
  }],
  ["vue", async (p: Record<string, unknown>) => {
    const app = createApp({ render: () => h(VWizard as any, { steps, ...p }, vueSlots) })
    app.mount(document.body.appendChild(document.createElement("div")))
    cleanups.push(() => app.unmount())
    await nextTick()
    return async (fn: () => void) => { fn(); await nextTick(); await nextTick() }
  }],
])("%s wizard navigation", (_, mount) => {
  it("stays on an invalid step, lists what to fix and focuses the summary; then moves on and focuses the heading", async () => {
    let errors = ["Le SIREN doit contenir 9 chiffres.", "La raison sociale est obligatoire."]
    const onStepChange = vi.fn()
    const run = await mount({ validate: () => errors, onStepChange })
    await run(() => button("Suivant").click())
    const summary = document.querySelector<HTMLElement>('[data-slot="wizard-errors"]')!
    expect(summary.getAttribute("role")).toBe("alert")
    expect(summary.textContent).toContain("2 points à corriger")
    expect(summary.textContent).toContain("Le SIREN doit contenir 9 chiffres.")
    expect(document.activeElement).toBe(summary)
    expect(document.body.textContent).toContain("contenu 1")

    errors = []
    await run(() => button("Suivant").click())
    expect(document.querySelector('[data-slot="wizard-errors"]')).toBeNull()
    expect(document.body.textContent).toContain("contenu 2")
    expect((document.activeElement as HTMLElement).tagName).toBe("H2")
    expect(document.activeElement?.textContent).toBe("Contact")
    expect(onStepChange).toHaveBeenLastCalledWith(2)

    await run(() => button("Précédent").click())
    expect(document.body.textContent).toContain("contenu 1")
  })

  it("submits from the review step once allowed, after checking every step", async () => {
    const onSubmit = vi.fn()
    const validate = vi.fn(() => [])
    const run = await mount({ validate, onSubmit, canSubmit: false, submitLabel: "Créer le compte" })
    await run(() => button("Suivant").click())
    await run(() => button("Suivant").click())
    expect(document.body.textContent).toContain("relecture")
    expect(button("Créer le compte").disabled).toBe(true)
    for (const c of cleanups.splice(0)) await c()
    document.body.innerHTML = ""

    const run2 = await mount({ validate, onSubmit, submitLabel: "Créer le compte" })
    await run2(() => button("Suivant").click())
    await run2(() => button("Suivant").click())
    validate.mockClear()
    await run2(() => button("Créer le compte").click())
    expect(validate.mock.calls.map((c) => (c as unknown[])[0])).toEqual([1, 2])
    expect(onSubmit).toHaveBeenCalledOnce()
  })

  it("moves the focus to the confirmation once done", async () => {
    await mount({ status: "done", doneTitle: "Compte créé" })
    await nextTick()
    expect(document.activeElement?.tagName).toBe("H1")
    expect(document.activeElement?.textContent).toBe("Compte créé")
  })
})
