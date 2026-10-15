"use client"

import * as React from "react"
import { type CellData, type Column, type ColumnDef, type ColumnOrderState, type ColumnVisibilityState, type RowData, type SortingState, type Updater, FlexRender, columnOrderingFeature, columnVisibilityFeature, rowSortingFeature, tableFeatures, useTable } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ChevronsUpDown, Columns3, GripVertical } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/registry/react/ui/button"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/registry/react/ui/dropdown-menu"
import { HorizontalScroll } from "@/registry/react/ui/horizontal-scroll"
import { Skeleton } from "@/registry/react/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/registry/react/ui/table"

// TanStack Table v9: sorting (rows are sorted by the page, never here), column order and column visibility.
export const dataTableFeatures = tableFeatures({ rowSortingFeature, columnOrderingFeature, columnVisibilityFeature })
export type DataTableFeatures = typeof dataTableFeatures

export function resolveUpdater<T>(updater: Updater<T>, current: T): T {
  return typeof updater === "function" ? (updater as (old: T) => T)(current) : updater
}

export function ariaSort(sorted: false | "asc" | "desc"): "ascending" | "descending" | undefined {
  return sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : undefined
}

export type SortCycle = "asc-desc-none" | "asc-desc"

// Header clicks cycle ascending → descending → no sort ("asc-desc": server sorts that never clear).
export function nextSort(sorted: false | "asc" | "desc", cycle: SortCycle = "asc-desc-none"): false | "asc" | "desc" {
  return sorted === false ? "asc" : sorted === "asc" ? "desc" : cycle === "asc-desc" ? "asc" : false
}

// A click on a control inside a clickable row belongs to that control, not to the row.
export function fromControl(event: { target: EventTarget | null; currentTarget: EventTarget | null }): boolean {
  const control = (event.target as Element | null)?.closest?.("a, button, input, select, textarea, label, [role=button], [role=checkbox], [role=menuitem], [contenteditable=true]")
  return !!control && control !== event.currentTarget && (event.currentTarget as Element).contains(control)
}

// Sticky cells sit on the container background (set --data-table-bg, e.g. to var(--card)) and stay opaque on hover.
export const stickyCell = "sticky left-0 z-[1] bg-(--data-table-bg) transition-colors [tr:hover>&]:bg-[color-mix(in_oklab,var(--muted)_50%,var(--data-table-bg))]"

const metaClass = (meta: unknown) => (meta as { className?: string } | undefined)?.className
// `meta.reorderable: false` keeps a column in place (first or last column…); every other column can move.
const reorderable = (meta: unknown) => (meta as { reorderable?: boolean } | undefined)?.reorderable !== false

type LabelledColumnDef = { id?: string; accessorKey?: unknown; header?: unknown; meta?: unknown; enableHiding?: boolean; columns?: LabelledColumnDef[] }
// The column's plain-text name (move handle, column picker): `meta.label`, else a string header, else its id.
export function columnLabel(def: LabelledColumnDef, id: string): string {
  return (def.meta as { label?: string } | undefined)?.label ?? (typeof def.header === "string" ? def.header : id)
}
// The id TanStack gives the column: `id`, else `accessorKey` (dots become underscores), else a string header.
const columnId = (def: LabelledColumnDef) =>
  def.id ?? (def.accessorKey === undefined ? undefined : String(def.accessorKey).replace(/\./g, "_")) ?? (typeof def.header === "string" ? def.header : undefined)
// Grouped definitions (`columns: [...]`) down to the columns that render cells.
const leafDefs = (defs: LabelledColumnDef[]): LabelledColumnDef[] => defs.flatMap((def) => (def.columns ? leafDefs(def.columns) : [def]))

/**
 * `id` takes `target`'s place: after it when moving right, before it when moving left. A move that would
 * shift a `locked` column (the target, or one in between) is refused: the order comes back unchanged.
 */
export function moveColumn(order: string[], id: string, target: string, locked: ReadonlySet<string> = new Set()): string[] {
  const from = order.indexOf(id)
  const to = order.indexOf(target)
  if (from < 0 || to < 0 || from === to) return order
  const shifted = from < to ? order.slice(from + 1, to + 1) : order.slice(to, from)
  if (shifted.some((column) => locked.has(column))) return order
  const next = order.filter((column) => column !== id)
  next.splice(to, 0, id)
  return next
}

type DataTableProps<TData extends RowData> = {
  // Columns mix value types, hence `any` (same as the upstream shadcn data table).
  columns: ColumnDef<DataTableFeatures, TData, any>[]
  data: TData[]
  getRowId?: (row: TData, index: number) => string
  sorting?: SortingState
  onSortingChange?: (sorting: SortingState) => void
  /**
   * Column ids in display order. Passing it turns on moving columns (drag a header's handle, or ←/→ on
   * the focused handle); ids with no column are kept in place, so a column shown later keeps its spot.
   */
  columnOrder?: ColumnOrderState
  onColumnOrderChange?: (columnOrder: ColumnOrderState) => void
  /** `{ [columnId]: false }` hides a column (see DataTableColumnPicker). */
  columnVisibility?: ColumnVisibilityState
  onColumnVisibilityChange?: (columnVisibility: ColumnVisibilityState) => void
  /** Live state for cells (read via `table.options.meta`), so `columns` can stay stable. */
  meta?: Record<string, unknown>
  loading?: boolean
  loadingRows?: number
  emptyMessage?: React.ReactNode
  stickyHeader?: boolean
  stickyFirstColumn?: boolean
  onRowClick?: (row: TData) => void
  /** Attributes for each <tr>: data-testid, className… */
  getRowProps?: (row: TData) => React.ComponentProps<"tr"> & Record<`data-${string}`, string | undefined>
  /** Attributes for the <table>: data-testid, aria-label… */
  tableProps?: React.ComponentProps<"table"> & Record<`data-${string}`, string | undefined>
  /** The scroll container (drag-to-scroll, IntersectionObserver root…). */
  scrollRef?: React.Ref<HTMLDivElement>
  /** Attributes, class and handlers for the scroll container (drag-to-scroll, scrollbar styling…). */
  scrollProps?: React.ComponentProps<"div"> & Record<`data-${string}`, string | undefined>
  /** false: no scroll container of its own (an outer scroller takes over; scrollRef / scrollProps are ignored). */
  container?: boolean
  /** false: no frame (a card frames the table). */
  bordered?: boolean
  /** Cells wrap (long messages) instead of staying on one line. */
  wrap?: boolean
  /** Wide tables: a horizontal scrollbar stuck to the bottom of the screen (see horizontal-scroll). */
  stickyScrollbar?: boolean
  /** Wide tables: drag with the mouse to scroll sideways (see horizontal-scroll). */
  dragToScroll?: boolean
  className?: string
  /** Rendered inside the scroll container, after the table (e.g. an infinite-scroll sentinel). */
  children?: React.ReactNode
}

// Saqara: sorting is always controlled — the page sorts (server or client) and passes `sorting` back.
function DataTable<TData extends RowData>({
  columns, data, getRowId, meta, sorting = [], onSortingChange, columnOrder, onColumnOrderChange, columnVisibility: requestedVisibility = {}, onColumnVisibilityChange, loading = false, loadingRows = 5,
  emptyMessage = "Aucun résultat.", stickyHeader = false, stickyFirstColumn = false,
  onRowClick, getRowProps, tableProps, scrollRef, scrollProps, container = true, bordered = true, wrap = false, stickyScrollbar = false, dragToScroll = false, className, children,
}: DataTableProps<TData>) {
  // TanStack would hide a column that `enableHiding: false` should keep visible (a stale stored layout…).
  const alwaysVisible = new Set(leafDefs(columns as LabelledColumnDef[]).flatMap((def) => (def.enableHiding === false ? [columnId(def)] : [])))
  const columnVisibility = Object.fromEntries(Object.entries(requestedVisibility).filter(([id]) => !alwaysVisible.has(id)))
  const table = useTable({
    features: dataTableFeatures,
    data,
    columns,
    getRowId,
    meta,
    manualSorting: true,
    state: { sorting, columnOrder: columnOrder ?? [], columnVisibility },
    onSortingChange: (updater) => onSortingChange?.(resolveUpdater(updater, sorting)),
    onColumnVisibilityChange: (updater) => onColumnVisibilityChange?.(resolveUpdater(updater, columnVisibility)),
  })
  const colCount = table.getVisibleLeafColumns().length

  // Moving columns: the new order is built on `columnOrder` itself, ids with no column included.
  const rootRef = React.useRef<HTMLDivElement>(null)
  const dragging = React.useRef<string | null>(null)
  const focusAfterMove = React.useRef<{ id: string; order: string } | null>(null)
  const [dropTarget, setDropTarget] = React.useState<string | null>(null)
  const [announcement, setAnnouncement] = React.useState("")
  const label = (column: Column<DataTableFeatures, TData, unknown>) => columnLabel(column.columnDef as LabelledColumnDef, column.id)
  const move = (id: string, target: string) => {
    const order = columnOrder ?? []
    const ids = table.getAllLeafColumns().map((column) => column.id)
    const locked = new Set(table.getAllLeafColumns().filter((column) => !reorderable(column.columnDef.meta)).map((column) => column.id))
    const current = [...order, ...ids.filter((column) => !order.includes(column))]
    const next = moveColumn(current, id, target, locked)
    if (next === current) return null
    const visible = table.getVisibleLeafColumns()
    const position = next.filter((column) => visible.some((v) => v.id === column)).indexOf(id) + 1
    const column = table.getColumn(id)
    if (column) setAnnouncement(`${label(column)} : colonne ${position} sur ${visible.length}`)
    onColumnOrderChange?.(next)
    return next
  }
  // A moved <th> loses focus in the browser: give it back to the handle once that order is rendered
  // (not on a later, unrelated change if the page refused the move).
  React.useEffect(() => {
    const pending = focusAfterMove.current
    focusAfterMove.current = null
    const id = pending && pending.order === columnOrder?.join() ? pending.id : null
    if (id) [...(rootRef.current?.querySelectorAll<HTMLElement>("[data-column-handle]") ?? [])].find((el) => el.dataset.columnHandle === id)?.focus()
  }, [columnOrder])
  const moveStep = (id: string, step: -1 | 1) => {
    const visible = table.getVisibleLeafColumns()
    const neighbour = visible[visible.findIndex((column) => column.id === id) + step]
    if (!neighbour || !reorderable(neighbour.columnDef.meta)) return
    const next = move(id, neighbour.id)
    if (next) focusAfterMove.current = { id, order: next.join() }
  }
  // Leaf columns only: a group header's id is not in the order.
  const movable = (column: Column<DataTableFeatures, TData, unknown>) => columnOrder !== undefined && column.columns.length === 0 && reorderable(column.columnDef.meta)
  const dropProps = (id: string): React.ComponentProps<"th"> => ({
    onDragOver: (event) => {
      if (!dragging.current || dragging.current === id) return
      event.preventDefault()
      event.dataTransfer.dropEffect = "move"
      setDropTarget(id)
    },
    onDragLeave: () => setDropTarget((current) => (current === id ? null : current)),
    onDrop: (event) => {
      event.preventDefault()
      const from = dragging.current
      dragging.current = null
      setDropTarget(null)
      if (from && from !== id) move(from, id)
    },
  })
  const handle = (column: Column<DataTableFeatures, TData, unknown>) => (
    // A span with role=button, not a <button>: Firefox does not start a drag from a <button>.
    // horizontal-scroll leaves [role=button] alone, so dragToScroll does not take the drag over.
    <Button asChild variant="ghost" size="icon-xs">
    <span role="button" tabIndex={0} draggable data-column-handle={column.id}
      aria-label={`Déplacer la colonne ${label(column)}`} title="Glisser pour déplacer, ou flèches gauche et droite"
      className="cursor-grab text-muted-foreground active:cursor-grabbing"
      onDragStart={(event) => {
        dragging.current = column.id
        event.dataTransfer.effectAllowed = "move"
        event.dataTransfer.setData("text/plain", column.id)
      }}
      onDragEnd={() => { dragging.current = null; setDropTarget(null) }}
      onKeyDown={(event) => {
        const step = event.key === "ArrowLeft" ? -1 : event.key === "ArrowRight" ? 1 : 0
        if (!step) return
        event.preventDefault()
        moveStep(column.id, step)
      }}>
      <GripVertical />
    </span>
    </Button>
  )
  const sticky = (index: number) => stickyFirstColumn && index === 0 && stickyCell
  const rows = table.getRowModel().rows
  const tableElement = (
      <Table container={false} wrap={wrap} {...tableProps} aria-busy={loading || undefined}>
        <TableHeader className={cn(stickyHeader && "sticky top-0 z-[2] bg-(--data-table-bg)")}>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id}>
              {group.headers.map((header, i) => (
                <TableHead key={header.id} aria-sort={ariaSort(header.column.getIsSorted())}
                  data-drop-target={dropTarget === header.column.id || undefined}
                  className={cn(sticky(i), "data-[drop-target]:bg-muted", metaClass(header.column.columnDef.meta))}
                  {...(movable(header.column) && dropProps(header.column.id))}>
                  {header.isPlaceholder ? null : movable(header.column) ? (
                    // Inline: a text-center / text-right header class still aligns the title and its handle.
                    <span className="inline-flex items-center gap-0.5"><FlexRender header={header} />{handle(header.column)}</span>
                  ) : <FlexRender header={header} />}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: loadingRows }, (_, r) => (
              <TableRow key={`loading-${r}`} data-loading>
                {Array.from({ length: colCount }, (_, c) => (
                  <TableCell key={c} className={cn(sticky(c))}><Skeleton className="h-4 w-full" /></TableCell>
                ))}
              </TableRow>
            ))
          ) : rows.length ? (
            rows.map((row) => {
              const { className: rowClass, ...rowProps } = getRowProps?.(row.original) ?? {}
              return (
                <TableRow
                  key={row.id}
                  {...rowProps}
                  className={cn(onRowClick && "cursor-pointer", rowClass)}
                  {...(onRowClick && {
                    tabIndex: 0,
                    onClick: (event: React.MouseEvent<HTMLTableRowElement>) => { if (!fromControl(event)) onRowClick(row.original) },
                    onKeyDown: (event: React.KeyboardEvent<HTMLTableRowElement>) => {
                      if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); onRowClick(row.original) }
                    },
                  })}
                >
                  {row.getVisibleCells().map((cell, i) => (
                    <TableCell key={cell.id} className={cn(sticky(i), metaClass(cell.column.columnDef.meta))}><FlexRender cell={cell} /></TableCell>
                  ))}
                </TableRow>
              )
            })
          ) : (
            <TableRow>
              <TableCell colSpan={colCount} className="h-24 text-center text-muted-foreground">{emptyMessage}</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
  )

  return (
    <div
      ref={rootRef}
      data-slot="data-table"
      className={cn("[--data-table-bg:var(--background)]", stickyHeader && "[&>[data-slot=table-container]]:max-h-[inherit] [&>[data-slot=table-container]]:overflow-auto", className)}
    >
      {!container ? <>{tableElement}{children}</>
        : stickyScrollbar || dragToScroll ? (
          // The scroll container becomes HorizontalScroll's viewport (sticky header and scrollRef kept).
          <HorizontalScroll stickyScrollbar={stickyScrollbar} dragToScroll={dragToScroll} viewportRef={scrollRef}
            // Sticky header: a flex column bounded by the table's max height; the viewport shrinks and scrolls
            // (an inherited percentage would resolve against a wrapper with no height).
            className={cn(stickyHeader && "flex max-h-[inherit] flex-col")}
            viewportProps={{ ...scrollProps, "data-slot": "table-container", className: cn("relative w-full", stickyHeader && "min-h-0 overflow-auto", bordered && "rounded-md border", scrollProps?.className) }}>
            {tableElement}
            {children}
          </HorizontalScroll>
        ) : (
          <div {...scrollProps} ref={scrollRef} data-slot="table-container" className={cn("relative w-full overflow-x-auto", bordered && "rounded-md border", scrollProps?.className)}>
            {tableElement}
            {children}
          </div>
        )}
      {columnOrder !== undefined && <span role="status" aria-live="polite" className="sr-only">{announcement}</span>}
    </div>
  )
}


function DataTableColumnHeader<TData extends RowData, TValue extends CellData>({ column, title, sortCycle = "asc-desc-none", thenBy, className, ...props }: {
  column: Column<DataTableFeatures, TData, TValue>
  title: string
  sortCycle?: SortCycle
  /** Tie-break keys: a click sorts by this column, then by these, in the same direction. */
  thenBy?: string[]
} & Omit<React.ComponentProps<typeof Button>, "onClick" | "children">) {
  if (!column.getCanSort()) return <>{title}</>
  const sorted = column.getIsSorted()
  const Icon = sorted === "asc" ? ArrowUp : sorted === "desc" ? ArrowDown : ChevronsUpDown
  return (
    <Button variant="ghost" size="sm" className={cn("-ml-3 h-8", className)} {...props} onClick={() => {
      const next = nextSort(sorted, sortCycle)
      if (thenBy?.length) {
        const desc = next === "desc"
        column.table.setSorting(next ? [{ id: column.id, desc }, ...thenBy.map((id) => ({ id, desc }))] : [])
      } else if (next) column.toggleSorting(next === "desc")
      else column.clearSorting()
    }}>
      {title}
      <Icon />
    </Button>
  )
}

/**
 * Show or hide columns, beside the table (a toolbar): one checkbox per column that can be hidden
 * (`enableHiding: false` keeps a column out of the list). Pass the table's `columns` and the same
 * `columnVisibility` as the DataTable. `onReset` adds « Réinitialiser les colonnes »: pass it only
 * when the layout differs from the default.
 */
function DataTableColumnPicker<TData extends RowData>({ columns, columnVisibility = {}, onColumnVisibilityChange, onReset,
  label = "Colonnes", resetLabel = "Réinitialiser les colonnes", className, ...props }: {
  columns: ColumnDef<DataTableFeatures, TData, any>[]
  columnVisibility?: ColumnVisibilityState
  onColumnVisibilityChange?: (columnVisibility: ColumnVisibilityState) => void
  onReset?: () => void
  label?: string
  resetLabel?: string
} & Omit<React.ComponentProps<typeof Button>, "children">) {
  const leaves = leafDefs(columns as LabelledColumnDef[])
  const hideable = leaves.flatMap((def) => {
    const id = columnId(def)
    return id && def.enableHiding !== false ? [{ id, label: columnLabel(def, id) }] : []
  })
  // The last visible column stays: a table with no column at all would be broken.
  const visibleCount = leaves.filter((def) => def.enableHiding === false || columnVisibility[columnId(def) ?? ""] !== false).length
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={className} {...props}><Columns3 />{label}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {hideable.map((column) => (
          // The menu stays open: several columns are usually toggled in a row.
          <DropdownMenuCheckboxItem key={column.id} checked={columnVisibility[column.id] !== false}
            disabled={visibleCount === 1 && columnVisibility[column.id] !== false} onSelect={(event) => event.preventDefault()}
            onCheckedChange={(checked) => onColumnVisibilityChange?.({ ...columnVisibility, [column.id]: checked === true })}>
            {column.label}
          </DropdownMenuCheckboxItem>
        ))}
        {onReset && <><DropdownMenuSeparator /><DropdownMenuItem onSelect={onReset}>{resetLabel}</DropdownMenuItem></>}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { DataTable, DataTableColumnHeader, DataTableColumnPicker }
