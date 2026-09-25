import { createElement } from "react"
import { renderToString } from "react-dom/server"
import { createSSRApp, h } from "vue"
import { renderToString as renderVue } from "vue/server-renderer"
import { describe, expect, it } from "vitest"
import { DataTable as ReactDataTable, ariaSort as reactAriaSort, nextSort as reactNextSort, resolveUpdater as reactResolve } from "../registry/react/ui/data-table"
import { Table as RTable } from "../registry/react/ui/table"
import { Table as VTable } from "../registry/vue/ui/table"
import { DataTable as VueDataTable, ariaSort as vueAriaSort, nextSort as vueNextSort, resolveUpdater as vueResolve } from "../registry/vue/ui/data-table"

type Row = { id: string; name: string }
const columns = [{ accessorKey: "name", header: "Raison sociale" }]
const data: Row[] = [{ id: "a", name: "Bâti Sud" }, { id: "b", name: "Élec Rhône" }]

const render = {
  react: async (props: Record<string, unknown>) => renderToString(createElement(ReactDataTable as any, { columns, ...props })),
  vue: async (props: Record<string, unknown>) => renderVue(createSSRApp({ render: () => h(VueDataTable as any, { columns, ...props }) })),
}
const helpers = { react: { ariaSort: reactAriaSort, resolveUpdater: reactResolve, nextSort: reactNextSort }, vue: { ariaSort: vueAriaSort, resolveUpdater: vueResolve, nextSort: vueNextSort } }

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
  it("cycles a header click through ascending, descending, then no sort", () => {
    expect([helpers[fw].nextSort(false), helpers[fw].nextSort("asc"), helpers[fw].nextSort("desc")]).toEqual(["asc", "desc", false])
  })
  it("flags the table as busy while loading", async () => {
    expect(await render[fw]({ data, loading: true })).toContain('aria-busy="true"')
    expect(await render[fw]({ data })).not.toContain('aria-busy="true"')
  })
  it("renders the empty message without data", async () => {
    expect(await render[fw]({ data: [], emptyMessage: "Aucune entreprise." })).toContain("Aucune entreprise.")
  })
  it("renders rows and marks the sorted column", async () => {
    const html = await render[fw]({ data, sorting: [{ id: "name", desc: false }] })
    expect(html).toContain("Élec Rhône")
    expect(html).toContain('aria-sort="ascending"')
  })
  it("spreads getRowProps on each row, merging its class", async () => {
    const html = await render[fw]({ data, getRowProps: (row: Row) => ({ "data-testid": `company-row-${row.id}`, class: "font-medium", className: "font-medium" }) })
    expect(html).toMatch(/<tr[^>]*data-testid="company-row-a"/)
    expect(html).toMatch(/<tr[^>]*class="[^"]*border-b[^"]*font-medium|<tr[^>]*class="[^"]*font-medium[^"]*border-b/)
  })
  it("makes rows clickable and focusable with onRowClick", async () => {
    const html = await render[fw]({ data, onRowClick: () => {} })
    expect(html).toMatch(/<tr[^>]*tabindex="0"/)
    expect(html).toMatch(/<tr[^>]*class="[^"]*cursor-pointer/)
    expect(await render[fw]({ data })).not.toMatch(/<tr[^>]*tabindex/)
  })
  it("passes tableProps to the <table>", async () => {
    expect(await render[fw]({ data, tableProps: { "data-testid": "companies" } })).toMatch(/<table[^>]*data-testid="companies"/)
  })
  it("applies column.meta.className to th and td", async () => {
    const html = await render[fw]({ data, columns: [{ accessorKey: "name", header: "Raison sociale", meta: { className: "w-64 text-right" } }] })
    expect(html).toMatch(/<th[^>]*class="[^"]*w-64 text-right/)
    expect(html).toMatch(/<td[^>]*class="[^"]*w-64 text-right/)
  })
  it("renders extra content inside the scroll container (infinite-scroll sentinel)", async () => {
    const html = await (fw === "react"
      ? renderToString(createElement(ReactDataTable as any, { columns, data }, createElement("div", { "data-sentinel": "" })))
      : renderVue(createSSRApp({ render: () => h(VueDataTable as any, { columns, data }, { default: () => h("div", { "data-sentinel": "" }) }) })))
    expect(html).toMatch(/data-slot="table-container"[\s\S]*<\/table>(<!--[^>]*-->)*<div data-sentinel/)
  })
  it("keeps sticky cells opaque on the container background, hover included", async () => {
    const html = await render[fw]({ data, stickyFirstColumn: true })
    const td = html.match(/<td[^>]*class="([^"]*sticky[^"]*)"/)![1].replace(/&gt;/g, ">").replace(/&amp;/g, "&")
    expect(td).toContain("bg-(--data-table-bg)")
    expect(td).toContain("[tr:hover>&]:bg-[color-mix(in_oklab,var(--muted)_50%,var(--data-table-bg))]")
  })
  it("offers an asc ⇄ desc cycle for server-sorted columns", () => {
    expect([helpers[fw].nextSort(false, "asc-desc"), helpers[fw].nextSort("asc", "asc-desc"), helpers[fw].nextSort("desc", "asc-desc")]).toEqual(["asc", "desc", "asc"])
  })
})

describe.each([
  ["react", async (p: Record<string, unknown>) => renderToString(createElement(RTable as any, p, createElement("tbody")))],
  ["vue", async (p: Record<string, unknown>) => renderVue(createSSRApp({ render: () => h(VTable as any, p, { default: () => h("tbody") }) }))],
])("%s table", (_, renderTable) => {
  it("drops its scroll wrapper with container={false}, and passes attributes to the <table>", async () => {
    expect(await renderTable({ "data-testid": "t" })).toMatch(/data-slot="table-container"[\s\S]*<table[^>]*data-testid="t"/)
    expect(await renderTable({ container: false })).not.toContain("table-container")
  })
})
