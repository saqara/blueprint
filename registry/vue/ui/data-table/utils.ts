import type { Updater } from "@tanstack/vue-table"
import { columnOrderingFeature, columnVisibilityFeature, rowSortingFeature, tableFeatures } from "@tanstack/vue-table"

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
export function fromControl(event: { target: EventTarget | null, currentTarget: EventTarget | null }): boolean {
  const control = (event.target as Element | null)?.closest?.("a, button, input, select, textarea, label, [role=button], [role=checkbox], [role=menuitem], [contenteditable=true]")
  return !!control && control !== event.currentTarget && (event.currentTarget as Element).contains(control)
}

// Sticky cells sit on the container background (set --data-table-bg, e.g. to var(--card)) and stay opaque on hover.
export const stickyCell = "sticky left-0 z-[1] bg-(--data-table-bg) transition-colors [tr:hover>&]:bg-[color-mix(in_oklab,var(--muted)_50%,var(--data-table-bg))]"

export const metaClass = (meta: unknown) => (meta as { className?: string } | undefined)?.className

// `meta.reorderable: false` keeps a column in place (first or last column…); every other column can move.
export const reorderable = (meta: unknown) => (meta as { reorderable?: boolean } | undefined)?.reorderable !== false

export type LabelledColumnDef = { id?: string, accessorKey?: unknown, header?: unknown, meta?: unknown, enableHiding?: boolean, columns?: LabelledColumnDef[] }
// The column's plain-text name (move handle, column picker): `meta.label`, else a string header, else its id.
export function columnLabel(def: LabelledColumnDef, id: string): string {
  return (def.meta as { label?: string } | undefined)?.label ?? (typeof def.header === "string" ? def.header : id)
}
// The id TanStack gives the column: `id`, else `accessorKey` (dots become underscores), else a string header.
export function columnId(def: LabelledColumnDef): string | undefined {
  return def.id ?? (def.accessorKey === undefined ? undefined : String(def.accessorKey).replace(/\./g, "_")) ?? (typeof def.header === "string" ? def.header : undefined)
}
// Grouped definitions (`columns: [...]`) down to the columns that render cells.
export const leafDefs = (defs: LabelledColumnDef[]): LabelledColumnDef[] => defs.flatMap(def => (def.columns ? leafDefs(def.columns) : [def]))

/**
 * `id` takes `target`'s place: after it when moving right, before it when moving left. A move that would
 * shift a `locked` column (the target, or one in between) is refused: the order comes back unchanged.
 */
export function moveColumn(order: string[], id: string, target: string, locked: ReadonlySet<string> = new Set()): string[] {
  const from = order.indexOf(id)
  const to = order.indexOf(target)
  if (from < 0 || to < 0 || from === to) return order
  const shifted = from < to ? order.slice(from + 1, to + 1) : order.slice(to, from)
  if (shifted.some(column => locked.has(column))) return order
  const next = order.filter(column => column !== id)
  next.splice(to, 0, id)
  return next
}
