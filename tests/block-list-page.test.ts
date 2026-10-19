import { createElement as e } from "react"
import { renderToString } from "react-dom/server"
import { createSSRApp, h } from "vue"
import { renderToString as renderVue } from "vue/server-renderer"
import { describe, expect, it } from "vitest"
import { ListPage as RListPage, pageItems } from "../registry/react/blocks/list-page"
import VListPage from "../registry/vue/blocks/ListPage.vue"

type Row = { id: string; name: string }
const columns = [{ accessorKey: "name", header: "Raison sociale" }]
const rows: Row[] = [{ id: "1", name: "Bâti Sud SAS" }, { id: "2", name: "Élec Rhône" }]
const noop = () => {}
const base = { title: "Entreprises", columns, getRowId: (r: Row) => r.id, page: 1, pageSize: 2, itemLabel: ["entreprise", "entreprises"] }

describe("pageItems", () => {
  it("keeps the first, the last and the current page's neighbours", () => {
    expect(pageItems(1, 1)).toEqual([1])
    expect(pageItems(1, 3)).toEqual([1, 2, 3])
    expect(pageItems(5, 10)).toEqual([1, "…", 4, 5, 6, "…", 10])
    expect(pageItems(10, 10)).toEqual([1, "…", 9, 10])
  })
})

describe.each([
  ["react", (p: Record<string, unknown>) => renderToString(e(RListPage as any, { ...base, onSearchChange: noop, onPageChange: noop, ...p }))],
  ["vue", (p: Record<string, unknown>) => renderVue(createSSRApp({ render: () => h(VListPage as any, { ...base, search: "", ...p }) }))],
] as const)("%s list-page block", (_, render) => {
  it("shows the rows, a named search and an announced French count", async () => {
    const html = await render({ data: rows, total: 7 })
    expect(html).toContain("Bâti Sud SAS")
    expect(html).toContain('aria-label="Rechercher"')
    expect(html).toMatch(/role="status"[^>]*>(<!--[^>]*-->)*\s*7 entreprises/)
    expect(html).toContain('aria-label="Page 4"')
  })
  it("tells an empty list from a filtered one", async () => {
    const empty = await render({ data: [], total: 0, emptyTitle: "Aucune entreprise suivie" })
    expect(empty).toContain("Aucune entreprise suivie")
    expect(empty).not.toContain('data-slot="list-toolbar"')
    const none = await render({ data: [], total: 0, filtered: true, onReset: noop })
    expect(none).toContain("Aucun résultat")
    expect(none).toContain("Réinitialiser les filtres")
    expect(none).toContain('data-slot="list-toolbar"')
  })
  it("announces loading and shows skeleton rows, without pagination", async () => {
    const html = await render({ data: [], total: 0, loading: true })
    expect(html).toContain("Chargement…")
    expect(html).toContain("data-loading")
    expect(html).not.toContain("Aucun élément")
  })
})
