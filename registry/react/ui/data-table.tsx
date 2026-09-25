"use client"

import * as React from "react"
import { type CellData, type Column, type ColumnDef, type RowData, type SortingState, type Updater, FlexRender, rowSortingFeature, tableFeatures, useTable } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/registry/react/ui/button"
import { Skeleton } from "@/registry/react/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/registry/react/ui/table"

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
export function fromControl(event: { target: EventTarget | null; currentTarget: EventTarget | null }): boolean {
  const control = (event.target as Element | null)?.closest?.("a, button, input, select, textarea, label, [role=button], [role=checkbox], [role=menuitem], [contenteditable=true]")
  return !!control && control !== event.currentTarget && (event.currentTarget as Element).contains(control)
}

// Sticky cells sit on the container background (set --data-table-bg, e.g. to var(--card)) and stay opaque on hover.
export const stickyCell = "sticky left-0 z-[1] bg-(--data-table-bg) transition-colors [tr:hover>&]:bg-[color-mix(in_oklab,var(--muted)_50%,var(--data-table-bg))]"

const metaClass = (meta: unknown) => (meta as { className?: string } | undefined)?.className

type DataTableProps<TData extends RowData> = {
  // Columns mix value types, hence `any` (same as the upstream shadcn data table).
  columns: ColumnDef<DataTableFeatures, TData, any>[]
  data: TData[]
  getRowId?: (row: TData, index: number) => string
  sorting?: SortingState
  onSortingChange?: (sorting: SortingState) => void
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
  className?: string
  /** Rendered inside the scroll container, after the table (e.g. an infinite-scroll sentinel). */
  children?: React.ReactNode
}

// Saqara: sorting is always controlled — the page sorts (server or client) and passes `sorting` back.
function DataTable<TData extends RowData>({
  columns, data, getRowId, sorting = [], onSortingChange, loading = false, loadingRows = 5,
  emptyMessage = "Aucun résultat.", stickyHeader = false, stickyFirstColumn = false,
  onRowClick, getRowProps, tableProps, scrollRef, scrollProps, className, children,
}: DataTableProps<TData>) {
  const table = useTable({
    features: dataTableFeatures,
    data,
    columns,
    getRowId,
    manualSorting: true,
    state: { sorting },
    onSortingChange: (updater) => onSortingChange?.(resolveUpdater(updater, sorting)),
  })
  const colCount = table.getAllLeafColumns().length
  const sticky = (index: number) => stickyFirstColumn && index === 0 && stickyCell
  const rows = table.getRowModel().rows

  return (
    <div
      data-slot="data-table"
      className={cn("[--data-table-bg:var(--background)]", stickyHeader && "[&>[data-slot=table-container]]:max-h-[inherit] [&>[data-slot=table-container]]:overflow-auto", className)}
    >
      <div {...scrollProps} ref={scrollRef} data-slot="table-container" className={cn("relative w-full overflow-x-auto", scrollProps?.className)}>
      <Table container={false} {...tableProps} aria-busy={loading || undefined}>
        <TableHeader className={cn(stickyHeader && "sticky top-0 z-[2] bg-(--data-table-bg)")}>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id}>
              {group.headers.map((header, i) => (
                <TableHead key={header.id} aria-sort={ariaSort(header.column.getIsSorted())} className={cn(sticky(i), metaClass(header.column.columnDef.meta))}>
                  {header.isPlaceholder ? null : <FlexRender header={header} />}
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
                  {row.getAllCells().map((cell, i) => (
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
      {children}
      </div>
    </div>
  )
}

function DataTableColumnHeader<TData extends RowData, TValue extends CellData>({ column, title, sortCycle = "asc-desc-none", className, ...props }: {
  column: Column<DataTableFeatures, TData, TValue>
  title: string
  sortCycle?: SortCycle
} & Omit<React.ComponentProps<typeof Button>, "onClick" | "children">) {
  if (!column.getCanSort()) return <>{title}</>
  const sorted = column.getIsSorted()
  const Icon = sorted === "asc" ? ArrowUp : sorted === "desc" ? ArrowDown : ChevronsUpDown
  return (
    <Button variant="ghost" size="sm" className={cn("-ml-3 h-8", className)} {...props} onClick={() => { const next = nextSort(sorted, sortCycle); if (next) column.toggleSorting(next === "desc"); else column.clearSorting() }}>
      {title}
      <Icon />
    </Button>
  )
}

export { DataTable, DataTableColumnHeader }
