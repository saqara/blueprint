import { createElement } from "react"
import { renderToString } from "react-dom/server"
import { createSSRApp, h } from "vue"
import { renderToString as renderVue } from "vue/server-renderer"
import { describe, expect, it } from "vitest"
import { DataTable as ReactDataTable, ariaSort as reactAriaSort, resolveUpdater as reactResolve } from "../registry/react/ui/data-table"
import { DataTable as VueDataTable, ariaSort as vueAriaSort, resolveUpdater as vueResolve } from "../registry/vue/ui/data-table"

type Row = { id: string; name: string }
const columns = [{ accessorKey: "name", header: "Raison sociale" }]
const data: Row[] = [{ id: "a", name: "Bâti Sud" }, { id: "b", name: "Élec Rhône" }]

const render = {
  react: async (props: Record<string, unknown>) => renderToString(createElement(ReactDataTable as any, { columns, ...props })),
  vue: async (props: Record<string, unknown>) => renderVue(createSSRApp({ render: () => h(VueDataTable as any, { columns, ...props }) })),
}
const helpers = { react: { ariaSort: reactAriaSort, resolveUpdater: reactResolve }, vue: { ariaSort: vueAriaSort, resolveUpdater: vueResolve } }

describe.each(["react", "vue"] as const)("%s data-table", (fw) => {
  it("resolves TanStack updaters (value or function)", () => {
    expect(helpers[fw].resolveUpdater([{ id: "x", desc: true }], [])).toEqual([{ id: "x", desc: true }])
    expect(helpers[fw].resolveUpdater((old: number[]) => [...old, 2], [1])).toEqual([1, 2])
  })
  it("maps sort state to aria-sort", () => {
    expect([helpers[fw].ariaSort("asc"), helpers[fw].ariaSort("desc"), helpers[fw].ariaSort(false)]).toEqual(["ascending", "descending", undefined])
  })
  it("renders loadingRows skeleton rows while loading", async () => {
    const html = await render[fw]({ data, loading: true, loadingRows: 4 })
    expect(html.match(/data-loading/g)).toHaveLength(4)
    expect(html).not.toContain("Bâti Sud")
  })
  it("renders the empty message without data", async () => {
    expect(await render[fw]({ data: [], emptyMessage: "Aucune entreprise." })).toContain("Aucune entreprise.")
  })
  it("renders rows and marks the sorted column", async () => {
    const html = await render[fw]({ data, sorting: [{ id: "name", desc: false }] })
    expect(html).toContain("Élec Rhône")
    expect(html).toContain('aria-sort="ascending"')
  })
})
