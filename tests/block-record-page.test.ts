import { createElement as e } from "react"
import { renderToString } from "react-dom/server"
import { createSSRApp, h } from "vue"
import { renderToString as renderVue } from "vue/server-renderer"
import { describe, expect, it } from "vitest"
import { RecordPage as RRecordPage } from "../registry/react/blocks/record-page"
import VRecordPage from "../registry/vue/blocks/RecordPage.vue"

const base = {
  title: "Bâti Sud SAS",
  status: { label: "Qualifié", variant: "success" as const },
  meta: ["SIREN 900 000 001", "Lyon (69)"],
  menuActions: [{ label: "Archiver", onSelect: () => {}, destructive: true }],
  facts: [{ label: "Effectif", value: "38 salariés" }],
}
const tabs = [{ value: "infos", label: "Informations" }, { value: "contacts", label: "Contacts", count: 3 }]

const react = (p: Record<string, unknown> = {}) =>
  renderToString(e(RRecordPage, { ...base, tabs: tabs.map((t) => ({ ...t, content: e("p", null, `Panneau ${t.value}`) })), ...p } as never))
const vue = (p: Record<string, unknown> = {}) =>
  renderVue(createSSRApp({ render: () => h(VRecordPage, { ...base, tabs, ...p }, { "tab-infos": () => h("p", null, "Panneau infos"), "tab-contacts": () => h("p", null, "Panneau contacts") }) }))

describe.each([["react", react], ["vue", vue]] as const)("%s record-page block", (_, render) => {
  it("has one h1 with the status and the metadata under it", async () => {
    const html = await render()
    expect(html.match(/<h1/g)).toHaveLength(1)
    expect(html).toMatch(/<h1[^>]*>(<!--[^>]*-->)*Bâti Sud SAS/)
    expect(html).toContain("Qualifié")
    expect(html).toContain("SIREN 900 000 001")
    expect(html).toContain('aria-hidden="true">·</span>')
  })
  it("names the overflow menu and renders tabs with counts, the first one open", async () => {
    const html = await render()
    expect(html).toContain('aria-label="Plus d’actions"')
    expect(html.match(/role="tab"/g)).toHaveLength(2)
    expect(html).toMatch(/role="tab"[^>]*aria-selected="true"[^>]*>(<!--[^>]*-->)*Informations/)
    expect(html).toMatch(/Contacts\s*(<!--[^>]*-->)*<span[^>]*data-slot="badge"[^>]*>(<!--[^>]*-->)*3</)
    expect(html).toContain("Panneau infos")
  })
  it("opens the tab given by defaultTab", async () => {
    expect(await render({ defaultTab: "contacts" })).toMatch(/role="tab"[^>]*aria-selected="true"[^>]*>(<!--[^>]*-->)*Contacts/)
  })
  it("puts the key facts in a labelled aside, as a definition list", async () => {
    const html = await render()
    const id = html.match(/<aside[^>]*aria-labelledby="([^"]+)"/)?.[1]
    expect(id).toBeTruthy()
    expect(html).toContain(`<h2 id="${id}"`)
    expect(html).toContain("Informations clés")
    expect(html).toMatch(/<dt[^>]*>Effectif<\/dt><dd[^>]*>38 salariés<\/dd>/)
  })
  it("drops the aside and the menu when there is nothing to put in them", async () => {
    const html = await render({ facts: [], menuActions: [] })
    expect(html).not.toContain("<aside")
    expect(html).not.toContain("Plus d’actions")
  })
})
