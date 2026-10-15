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

export type LabelledColumnDef = { id?: string, accessorKey?: unknown, header?: unknown, meta?: unknown, enableHiding?: boolean }
// The column's plain-text name (move handle, column picker): `meta.label`, else a string header, else its id.
export function columnLabel(def: LabelledColumnDef, id: string): string {
  return (def.meta as { label?: string } | undefined)?.label ?? (typeof def.header === "string" ? def.header : id)
}
export const columnId = (def: LabelledColumnDef) => def.id ?? (typeof def.accessorKey === "string" ? def.accessorKey : undefined)

/** `id` takes `target`'s place: after it when moving right, before it when moving left. */
export function moveColumn(order: string[], id: string, target: string): string[] {
  const from = order.indexOf(id)
  const to = order.indexOf(target)
  if (from < 0 || to < 0 || from === to) return order
  const next = order.filter(column => column !== id)
  next.splice(to, 0, id)
  return next
}
