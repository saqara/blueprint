import { createElement as e } from "react"
import { renderToString } from "react-dom/server"
import { createSSRApp, h } from "vue"
import { renderToString as renderVue } from "vue/server-renderer"
import { describe, expect, it } from "vitest"
import { SettingsPage as RSettings } from "../registry/react/blocks/settings-page"
import VSettings from "../registry/vue/blocks/SettingsPage.vue"

const sections = [{ id: "compte", label: "Compte" }, { id: "organisation", label: "Organisation" }]

const react = (p: Record<string, unknown>) =>
  renderToString(e(RSettings, { sections: sections.map((s) => ({ ...s, content: e("p", null, `champs ${s.id}`) })), ...p }))
const vue = (p: Record<string, unknown>) =>
  renderVue(createSSRApp({ render: () => h(VSettings, { sections, ...p }, { compte: () => h("p", null, "champs compte"), organisation: () => h("p", null, "champs organisation") }) }))

// The visible section and the one marked current, read from the HTML.
const shown = (html: string) => [...html.matchAll(/<section[^>]*>/g)].filter((m) => !/\shidden/.test(m[0])).length
const current = (html: string) => html.match(/aria-current="page"[^>]*>(?:<!--[^>]*-->)*([^<]+)/)?.[1].trim()

describe.each([["react", react], ["vue", vue]] as const)("%s settings-page block", (_, render) => {
  it("shows the first section, marked current in a named nav, the others mounted but hidden", async () => {
    const html = await render({})
    expect(html).toContain('aria-label="Sections des paramètres"')
    expect(current(html)).toBe("Compte")
    expect(shown(html)).toBe(1)
    expect(html).toContain("champs organisation")
  })
  it("follows a controlled active section", async () => {
    expect(current(await render({ activeSection: "organisation" }))).toBe("Organisation")
  })
  it("hides the save bar until the form is dirty, then announces it", async () => {
    expect(await render({})).toMatch(/data-slot="settings-save-bar"[^>]*hidden/)
    const dirty = await render({ dirty: true })
    expect(dirty).not.toMatch(/data-slot="settings-save-bar"[^>]*hidden/)
    expect(dirty).toMatch(/role="status"[^>]*>Modifications non enregistrées\./)
    expect(dirty).toContain(">Enregistrer<")
  })
  it("announces saving and errors, and locks the buttons while saving", async () => {
    const saving = await render({ dirty: true, status: "saving" })
    expect(saving).toMatch(/role="status"[^>]*>Enregistrement…/)
    expect(saving).toMatch(/<button[^>]*disabled[^>]*>(?:<!--[^>]*-->)*Annuler/)
    expect(await render({ dirty: true, status: "error", error: "SIRET invalide." })).toMatch(/role="status"[^>]*>SIRET invalide\./)
  })
  it("announces a save that went through", async () => {
    expect(await render({ status: "saved" })).toMatch(/role="status"[^>]*>Modifications enregistrées\./)
  })
})
