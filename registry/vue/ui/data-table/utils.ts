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

// Header clicks cycle ascending → descending → no sort.
export function nextSort(sorted: false | "asc" | "desc"): false | "asc" | "desc" {
  return sorted === false ? "asc" : sorted === "asc" ? "desc" : false
}
