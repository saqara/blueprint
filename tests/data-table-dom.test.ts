// @vitest-environment happy-dom
import { act, createElement as e, createRef } from "react"
import { createRoot } from "react-dom/client"
import { createApp, h, nextTick, ref } from "vue"
import { afterEach, describe, expect, it, vi } from "vitest"
import { DataTable as RDataTable, DataTableColumnHeader as RHeader } from "../registry/react/ui/data-table"
import { DataTable as VDataTable, DataTableColumnHeader as VHeader } from "../registry/vue/ui/data-table"

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
type Row = { id: string; name: string }
const data: Row[] = [{ id: "a", name: "Bâti Sud" }]
const cleanups: (() => unknown)[] = []
afterEach(async () => {
  for (const c of cleanups.splice(0)) await c()
  document.body.innerHTML = ""
})

async function mountReact(props: Record<string, unknown>, columns: unknown[]) {
  const root = createRoot(document.body.appendChild(document.createElement("div")))
  await act(async () => root.render(e(RDataTable as any, { columns, data, ...props })))
  cleanups.push(() => act(async () => root.unmount()))
  return (fn: () => void) => act(async () => fn())
}
async function mountVue(props: Record<string, unknown>, columns: unknown[]) {
  const app = createApp({ render: () => h(VDataTable as any, { columns, data, ...props }) })
  app.mount(document.body.appendChild(document.createElement("div")))
  cleanups.push(() => app.unmount())
  await nextTick()
  return async (fn: () => void) => { fn(); await nextTick() }
}

const cols = {
  react: [{ accessorKey: "name", header: "Raison sociale", cell: ({ row }: any) => e("span", null, row.original.name, e("button", { type: "button" }, "Copier")) }],
  vue: [{ accessorKey: "name", header: "Raison sociale", cell: ({ row }: any) => h("span", [row.original.name, h("button", { type: "button" }, "Copier")]) }],
}

describe.each([["react", mountReact], ["vue", mountVue]] as const)("%s data-table rows (DOM)", (fw, mount) => {
  it("calls onRowClick on click and Enter, but not from a control inside the row", async () => {
    const onRowClick = vi.fn()
    const run = await mount({ onRowClick }, cols[fw])
    const tr = document.querySelector<HTMLElement>("tbody tr")!
    await run(() => tr.querySelector("td")!.click())
    await run(() => tr.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })))
    await run(() => tr.querySelector("button")!.click())
    expect(onRowClick).toHaveBeenCalledTimes(2)
    expect(onRowClick).toHaveBeenLastCalledWith(data[0])
  })
})

describe("scroll container ref", () => {
  it("react: scrollRef points at the scroll container", async () => {
    const scrollRef = createRef<HTMLDivElement>()
    await mountReact({ scrollRef }, cols.react)
    expect(scrollRef.current?.dataset.slot).toBe("table-container")
  })
  it("vue: exposes scrollContainer", async () => {
    const table = ref<{ scrollContainer: HTMLElement | null }>()
    const app = createApp({ render: () => h(VDataTable as any, { ref: table, columns: cols.vue, data }) })
    app.mount(document.body.appendChild(document.createElement("div")))
    cleanups.push(() => app.unmount())
    await nextTick()
    expect(table.value?.scrollContainer?.dataset.slot).toBe("table-container")
  })
})

describe("column header", () => {
  const column = (sorted: false | "asc" | "desc") => ({ getCanSort: () => true, getIsSorted: () => sorted, toggleSorting: vi.fn(), clearSorting: vi.fn() })
  it.each([["react"], ["vue"]])("%s: asc-desc never clears, and passes attributes to the button", async (fw) => {
    const col = column("desc")
    if (fw === "react") {
      const root = createRoot(document.body.appendChild(document.createElement("div")))
      await act(async () => root.render(e(RHeader as any, { column: col, title: "Nom", sortCycle: "asc-desc", "data-testid": "sort-name" })))
      cleanups.push(() => act(async () => root.unmount()))
    } else {
      const app = createApp({ render: () => h(VHeader as any, { column: col, title: "Nom", sortCycle: "asc-desc", "data-testid": "sort-name" }) })
      app.mount(document.body.appendChild(document.createElement("div")))
      cleanups.push(() => app.unmount())
      await nextTick()
    }
    const button = document.querySelector<HTMLElement>("[data-testid=sort-name]")!
    await act(async () => button.click())
    expect(col.clearSorting).not.toHaveBeenCalled()
    expect(col.toggleSorting).toHaveBeenCalledWith(false)
  })
})
