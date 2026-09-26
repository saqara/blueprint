import { createElement as e } from "react"
import { renderToString } from "react-dom/server"
import { createSSRApp, h } from "vue"
import { renderToString as renderVue } from "vue/server-renderer"
import { describe, expect, it } from "vitest"
import { PageHeader as RPage, SectionHeader as RSection } from "../registry/react/ui/page-header"
import { PageHeader as VPage, SectionHeader as VSection } from "../registry/vue/ui/page-header"
import { ListToolbar as RToolbar } from "../registry/react/ui/list-toolbar"
import { ListToolbar as VToolbar } from "../registry/vue/ui/list-toolbar"

const vue = (node: () => ReturnType<typeof h>) => renderVue(createSSRApp({ render: node }))
const btn = { react: () => e("button", null, "Ajouter"), vue: () => h("button", "Ajouter") }

describe.each([
  ["react", (level: 1 | 2) => Promise.resolve(renderToString(e(level === 1 ? RPage : RSection, { title: "Mes entreprises", description: "24 entreprises suivies", actions: btn.react() })))],
  ["vue", (level: 1 | 2) => vue(() => h(level === 1 ? VPage : VSection, { title: "Mes entreprises", description: "24 entreprises suivies" }, { actions: btn.vue }))],
])("%s page / section header", (_, render) => {
  it("titles the page with an h1, description and actions on the right", async () => {
    const html = await render(1)
    expect(html).toMatch(/<h1[^>]*>(<!--[^>]*-->)*Mes entreprises/)
    expect(html).toContain("24 entreprises suivies")
    expect(html).toMatch(/data-slot="page-header-actions"[\s\S]*Ajouter/)
    expect(html).toMatch(/data-slot="page-header"[^>]*class="[^"]*flex-wrap/)
  })
  it("titles a section with an h2", async () => {
    expect(await render(2)).toMatch(/<h2[^>]*>(<!--[^>]*-->)*Mes entreprises/)
  })
})

describe.each([
  ["react", () => Promise.resolve(renderToString(e(RToolbar, { search: e("input", { "aria-label": "Rechercher" }), filters: e("select", { "aria-label": "Statut" }), actions: btn.react() })))],
  ["vue", () => vue(() => h(VToolbar, null, { search: () => h("input", { "aria-label": "Rechercher" }), filters: () => h("select", { "aria-label": "Statut" }), actions: btn.vue }))],
])("%s list-toolbar", (_, render) => {
  it("lets search grow, keeps filters, pushes actions right, wraps", async () => {
    const html = await render()
    const cls = (slot: string) => html.match(new RegExp(`data-slot="${slot}"[^>]*class="([^"]*)"|class="([^"]*)"[^>]*data-slot="${slot}"`))!.slice(1).find(Boolean)!
    expect(cls("list-toolbar")).toContain("flex-wrap")
    expect(cls("list-toolbar-search")).toMatch(/flex-1/)
    expect(cls("list-toolbar-search")).toMatch(/min-w-64/)
    expect(cls("list-toolbar-actions")).toContain("ml-auto")
  })
})
