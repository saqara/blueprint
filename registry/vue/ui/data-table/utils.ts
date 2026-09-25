import type { Updater } from "@tanstack/vue-table"
import { rowSortingFeature, tableFeatures } from "@tanstack/vue-table"

// TanStack Table v9: only sorting is registered (rows are sorted by the page, never here).
export const dataTableFeatures = tableFeatures({ rowSortingFeature })
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
