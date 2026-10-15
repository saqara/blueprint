// @vitest-environment happy-dom
import { act, createElement as e } from "react"
import { createRoot } from "react-dom/client"
import { createApp, h, nextTick, ref } from "vue"
import { afterEach, describe, expect, it, vi } from "vitest"
import { DataTable as RDataTable, DataTableColumnPicker as RPicker, moveColumn as reactMoveColumn } from "../registry/react/ui/data-table"
import { DataTable as VDataTable, DataTableColumnPicker as VPicker, moveColumn as vueMoveColumn } from "../registry/vue/ui/data-table"

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
type Row = { id: string; a: string; b: string; c: string; d: string }
const data: Row[] = [{ id: "1", a: "Bâti Sud", b: "Lyon", c: "16", d: "…" }]
// a and d are locked (never moved); a is not hideable either. b has a render-function header, labelled by meta.label.
const columns = [
  { accessorKey: "a", header: "Raison sociale", enableHiding: false, meta: { reorderable: false } },
  { accessorKey: "b", header: () => "Ville", meta: { label: "Ville" } },
  { accessorKey: "c", header: "Note" },
  { accessorKey: "d", header: "Actions", meta: { reorderable: false } },
]
const cleanups: (() => unknown)[] = []
afterEach(async () => {
  for (const c of cleanups.splice(0)) await c()
  document.body.innerHTML = ""
})

type State = { columnOrder?: string[]; columnVisibility?: Record<string, boolean> }
/** Mounts a controlled table: each change is recorded and fed back as the new prop, as a page would. */
async function mountReact(initial: State & Record<string, unknown>) {
  const changes = { order: vi.fn(), visibility: vi.fn() }
  const root = createRoot(document.body.appendChild(document.createElement("div")))
  let state = initial
  const draw = () => act(async () => root.render(e(RDataTable as any, {
    columns, data, ...state,
    onColumnOrderChange: (columnOrder: string[]) => { changes.order(columnOrder); state = { ...state, columnOrder }; void draw() },
    onColumnVisibilityChange: (columnVisibility: Record<string, boolean>) => { changes.visibility(columnVisibility); state = { ...state, columnVisibility }; void draw() },
  })))
  await draw()
  cleanups.push(() => act(async () => root.unmount()))
  return { changes, run: (fn: () => void) => act(async () => fn()) }
}
async function mountVue(initial: State & Record<string, unknown>) {
  const changes = { order: vi.fn(), visibility: vi.fn() }
  const state = ref<State & Record<string, unknown>>(initial)
  const app = createApp({ render: () => h(VDataTable as any, {
    columns, data, ...state.value,
    "onUpdate:columnOrder": (columnOrder: string[]) => { changes.order(columnOrder); state.value = { ...state.value, columnOrder } },
    "onUpdate:columnVisibility": (columnVisibility: Record<string, boolean>) => { changes.visibility(columnVisibility); state.value = { ...state.value, columnVisibility } },
  }) })
  app.mount(document.body.appendChild(document.createElement("div")))
  cleanups.push(() => app.unmount())
  await nextTick()
  return { changes, run: async (fn: () => void) => { fn(); await nextTick(); await nextTick() } }
}

const headers = () => [...document.querySelectorAll("thead th")].map((th) => th.textContent?.trim())
const handle = (id: string) => document.querySelector<HTMLButtonElement>(`[data-column-handle="${id}"]`)
const th = (id: string) => handle(id)!.closest("th")!
const key = (el: HTMLElement, k: string) => el.dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true }))
const drag = (type: string, el: HTMLElement) => {
  const event = new Event(type, { bubbles: true, cancelable: true }) as DragEvent
  Object.defineProperty(event, "dataTransfer", { value: { setData: () => {}, getData: () => "", effectAllowed: "", dropEffect: "" } })
  el.dispatchEvent(event)
}

describe.each([["react", mountReact], ["vue", mountVue]] as const)("%s data-table column order and visibility", (_, mount) => {
  it("renders the columns in columnOrder, without the hidden ones", async () => {
    await mount({ columnOrder: ["a", "c", "b", "d"], columnVisibility: { c: false } })
    expect(headers()).toEqual(["Raison sociale", "Ville", "Actions"])
    expect([...document.querySelectorAll("tbody td")].map((td) => td.textContent)).toEqual(["Bâti Sud", "Lyon", "…"])
  })

  it("spans the visible columns only in the empty and loading rows", async () => {
    await mount({ data: [], columnVisibility: { b: false } })
    expect(document.querySelector("tbody td")!.getAttribute("colspan")).toBe("3")
    document.body.innerHTML = ""
    await mount({ loading: true, loadingRows: 1, columnVisibility: { b: false, c: false } })
    expect(document.querySelectorAll("tbody tr[data-loading] td")).toHaveLength(2)
  })

  it("shows no move handle unless columnOrder is passed", async () => {
    await mount({})
    expect(document.querySelector("[data-column-handle]")).toBeNull()
  })

  it("offers a focusable button handle on the movable columns only, named after the column", async () => {
    await mount({ columnOrder: ["a", "b", "c", "d"] })
    expect([...document.querySelectorAll<HTMLElement>("[data-column-handle]")].map((b) => b.dataset.columnHandle)).toEqual(["b", "c"])
    // A span with role=button, not a <button>: Firefox does not start a drag from a <button>.
    expect(handle("b")!.getAttribute("role")).toBe("button")
    expect(handle("b")!.tabIndex).toBe(0)
    expect(handle("b")!.getAttribute("draggable")).toBe("true")
    expect(handle("b")!.getAttribute("aria-label")).toBe("Déplacer la colonne Ville")
  })

  it("moves a column one step from the keyboard, keeps focus on its handle and announces it", async () => {
    // "ghost" is a column the table does not show right now (e.g. a proximity column): its place is kept.
    const { changes, run } = await mount({ columnOrder: ["a", "ghost", "b", "c", "d"] })
    handle("b")!.focus()
    await run(() => key(handle("b")!, "ArrowRight"))
    expect(changes.order).toHaveBeenLastCalledWith(["a", "ghost", "c", "b", "d"])
    expect(headers()).toEqual(["Raison sociale", "Note", "Ville", "Actions"])
    expect(document.activeElement).toBe(handle("b"))
    expect(document.querySelector("[data-slot=data-table] [role=status]")!.textContent).toBe("Ville : colonne 3 sur 4")
    await run(() => key(handle("b")!, "ArrowLeft"))
    expect(changes.order).toHaveBeenLastCalledWith(["a", "ghost", "b", "c", "d"])
  })

  it("never moves a column past a locked one", async () => {
    const { changes, run } = await mount({ columnOrder: ["a", "b", "c", "d"] })
    await run(() => key(handle("b")!, "ArrowLeft"))
    await run(() => key(handle("c")!, "ArrowRight"))
    expect(changes.order).not.toHaveBeenCalled()
  })

  it("moves a column dropped on another header to that header's place", async () => {
    const { changes, run } = await mount({ columnOrder: ["a", "ghost", "b", "c", "d"] })
    await run(() => drag("dragstart", handle("c")!))
    await run(() => { drag("dragover", th("b")); drag("drop", th("b")) })
    expect(changes.order).toHaveBeenLastCalledWith(["a", "ghost", "c", "b", "d"])
  })

  it("refuses a drop on a locked column", async () => {
    const { changes, run } = await mount({ columnOrder: ["a", "b", "c", "d"] })
    await run(() => drag("dragstart", handle("b")!))
    const actions = [...document.querySelectorAll<HTMLElement>("thead th")].at(-1)!
    await run(() => { drag("dragover", actions); drag("drop", actions) })
    expect(changes.order).not.toHaveBeenCalled()
  })

  it("never moves a locked column in the middle by dropping across it", async () => {
    const locked = [columns[0], columns[1], { ...columns[2], meta: { reorderable: false } }, { accessorKey: "e", header: "Effectif" }, columns[3]]
    const { changes, run } = await mount({ columns: locked, columnOrder: ["a", "b", "c", "e", "d"] })
    await run(() => drag("dragstart", handle("b")!))
    await run(() => { drag("dragover", th("e")); drag("drop", th("e")) })
    expect(changes.order).not.toHaveBeenCalled()
  })

  it("keeps a column that cannot be hidden visible, whatever columnVisibility says", async () => {
    await mount({ columnVisibility: { a: false, c: false } })
    expect(headers()).toEqual(["Raison sociale", "Ville", "Actions"])
  })

  it("does not take the focus back on a later order change when the page refused a move", async () => {
    const changes = vi.fn()
    if (_ === "react") {
      const root = createRoot(document.body.appendChild(document.createElement("div")))
      const draw = (columnOrder: string[]) => act(async () => root.render(e(RDataTable as any, { columns, data, columnOrder, onColumnOrderChange: changes })))
      await draw(["a", "b", "c", "d"])
      cleanups.push(() => act(async () => root.unmount()))
      await act(async () => key(handle("b")!, "ArrowRight"))
      document.body.appendChild(document.createElement("input")).focus()
      await draw(["a", "b", "c", "d", "x"])
    } else {
      const order = ref(["a", "b", "c", "d"])
      const app = createApp({ render: () => h(VDataTable as any, { columns, data, columnOrder: order.value, "onUpdate:columnOrder": changes }) })
      app.mount(document.body.appendChild(document.createElement("div")))
      cleanups.push(() => app.unmount())
      await nextTick()
      key(handle("b")!, "ArrowRight")
      await nextTick()
      document.body.appendChild(document.createElement("input")).focus()
      order.value = ["a", "b", "c", "d", "x"]
      await nextTick(); await nextTick()
    }
    expect(changes).toHaveBeenCalled()
    expect(document.activeElement?.tagName).toBe("INPUT")
  })

  it("offers handles on leaf columns only, never on a group header", async () => {
    const grouped = [columns[0], { id: "group", header: "Notes", columns: [columns[1], columns[2]] }, columns[3]]
    await mount({ columns: grouped, columnOrder: ["a", "b", "c", "d"] })
    expect([...document.querySelectorAll<HTMLElement>("[data-column-handle]")].map((b) => b.dataset.columnHandle)).toEqual(["b", "c"])
  })

  it("keeps a nested column that cannot be hidden visible", async () => {
    const grouped = [{ id: "group", header: "Tout", columns: columns }]
    await mount({ columns: grouped, columnVisibility: { a: false, c: false } })
    expect(headers().slice(-3)).toEqual(["Raison sociale", "Ville", "Actions"])
  })

  it("does not start the drag-to-scroll from a handle", async () => {
    const capture = vi.spyOn(HTMLElement.prototype, "setPointerCapture").mockImplementation(() => {})
    const { run } = await mount({ columnOrder: ["a", "b", "c", "d"], dragToScroll: true })
    const pointer = (type: string, x: number) => handle("b")!.dispatchEvent(new PointerEvent(type, { clientX: x, button: 0, pointerType: "mouse", bubbles: true }))
    await run(() => { pointer("pointerdown", 500); pointer("pointermove", 400); pointer("pointerup", 400) })
    expect(capture).not.toHaveBeenCalled()
    capture.mockRestore()
  })
})

describe.each(["react", "vue"] as const)("%s moveColumn", (fw) => {
  const moveColumn = fw === "react" ? reactMoveColumn : vueMoveColumn
  it("puts the column at the target's place, from either side", () => {
    expect(moveColumn(["a", "b", "c", "d"], "b", "c")).toEqual(["a", "c", "b", "d"])
    expect(moveColumn(["a", "b", "c", "d"], "d", "b")).toEqual(["a", "d", "b", "c"])
    expect(moveColumn(["a", "b", "c"], "b", "b")).toEqual(["a", "b", "c"])
  })
  it("refuses a move that would shift a locked column", () => {
    const locked = new Set(["a", "c", "e"])
    expect(moveColumn(["a", "b", "c", "d", "e"], "b", "d", locked)).toEqual(["a", "b", "c", "d", "e"])
    expect(moveColumn(["a", "b", "c", "d", "e"], "d", "b", locked)).toEqual(["a", "b", "c", "d", "e"])
    expect(moveColumn(["a", "b", "c", "d", "e"], "b", "c", locked)).toEqual(["a", "b", "c", "d", "e"])
    expect(moveColumn(["a", "b", "x", "d", "e"], "b", "d", locked)).toEqual(["a", "x", "d", "b", "e"])
  })
})

// The picker lives outside the table (a toolbar), so it reads the same columns and visibility as the table.
async function mountReactPicker(props: Record<string, unknown>) {
  const visibility = vi.fn()
  const root = createRoot(document.body.appendChild(document.createElement("div")))
  await act(async () => root.render(e(RPicker as any, { columns, onColumnVisibilityChange: visibility, ...props })))
  cleanups.push(() => act(async () => root.unmount()))
  return { visibility, run: (fn: () => void) => act(async () => fn()) }
}
async function mountVuePicker(props: Record<string, unknown>) {
  const visibility = vi.fn()
  const app = createApp({ render: () => h(VPicker as any, { columns, "onUpdate:columnVisibility": visibility, ...props }) })
  app.mount(document.body.appendChild(document.createElement("div")))
  cleanups.push(() => app.unmount())
  await nextTick()
  return { visibility, run: async (fn: () => void) => { fn(); await nextTick(); await nextTick() } }
}

describe.each([["react", mountReactPicker], ["vue", mountVuePicker]] as const)("%s DataTableColumnPicker", (_, mount) => {
  const open = async (run: (fn: () => void) => Promise<void>) => {
    const trigger = document.querySelector<HTMLButtonElement>("button")!
    // ArrowDown opens the menu in both Radix and Reka (Enter would toggle it).
    await run(() => key(trigger, "ArrowDown"))
  }
  const items = () => [...document.querySelectorAll<HTMLElement>("[role=menuitemcheckbox]")]

  it("lists the hideable columns with their state, and reports a toggle", async () => {
    const { visibility, run } = await mount({ columnVisibility: { c: false } })
    expect(document.querySelector("button")!.textContent).toContain("Colonnes")
    await open(run)
    expect(items().map((i) => i.textContent?.trim())).toEqual(["Ville", "Note", "Actions"])
    expect(items().map((i) => i.getAttribute("aria-checked"))).toEqual(["true", "false", "true"])
    await run(() => items()[1].click())
    expect(visibility).toHaveBeenLastCalledWith({ c: true })
  })

  it("lists nested columns, with the ids TanStack gives them", async () => {
    const nested = [{ id: "group", header: "Tout", columns: [
      { accessorKey: "address.city", header: "Ville" },
      { accessorFn: (row: Row) => row.c, header: "Note" },
    ] }]
    const { visibility, run } = await mount({ columns: nested, columnVisibility: {} })
    await open(run)
    expect(items().map((i) => i.textContent?.trim())).toEqual(["Ville", "Note"])
    await run(() => items()[0].click())
    expect(visibility).toHaveBeenLastCalledWith({ address_city: false })
    await run(() => items()[1].click())
    expect(visibility).toHaveBeenLastCalledWith({ Note: false })
  })

  it("never lets the last visible column be hidden", async () => {
    const { run } = await mount({ columns: [columns[1], columns[2]], columnVisibility: { c: false } })
    await open(run)
    expect(items().map((i) => i.getAttribute("data-disabled") !== null)).toEqual([true, false])
  })

  it("offers no reset without onReset", async () => {
    const { run } = await mount({})
    await open(run)
    expect(items()).toHaveLength(3)
    expect(document.body.textContent).not.toContain("Réinitialiser les colonnes")
  })

  it("offers the reset when onReset is passed", async () => {
    const onReset = vi.fn()
    const { run } = await mount({ onReset })
    await open(run)
    const reset = [...document.querySelectorAll<HTMLElement>("[role=menuitem]")].find((i) => i.textContent?.includes("Réinitialiser les colonnes"))!
    await run(() => reset.click())
    expect(onReset).toHaveBeenCalled()
  })
})
