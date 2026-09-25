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
  className?: string
}

// Saqara: sorting is always controlled — the page sorts (server or client) and passes `sorting` back.
function DataTable<TData extends RowData>({
  columns, data, getRowId, sorting = [], onSortingChange, loading = false, loadingRows = 5,
  emptyMessage = "Aucun résultat.", stickyHeader = false, stickyFirstColumn = false, className,
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
  const sticky = (index: number) => stickyFirstColumn && index === 0 && "sticky left-0 z-[1] bg-background"
  const rows = table.getRowModel().rows

  return (
    <div
      data-slot="data-table"
      className={cn(stickyHeader && "[&>[data-slot=table-container]]:max-h-[inherit] [&>[data-slot=table-container]]:overflow-auto", className)}
    >
      <Table>
        <TableHeader className={cn(stickyHeader && "sticky top-0 z-[2] bg-background")}>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id}>
              {group.headers.map((header, i) => (
                <TableHead key={header.id} aria-sort={ariaSort(header.column.getIsSorted())} className={cn(sticky(i))}>
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
            rows.map((row) => (
              <TableRow key={row.id}>
                {row.getAllCells().map((cell, i) => (
                  <TableCell key={cell.id} className={cn(sticky(i))}><FlexRender cell={cell} /></TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={colCount} className="h-24 text-center text-muted-foreground">{emptyMessage}</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

function DataTableColumnHeader<TData extends RowData, TValue extends CellData>({ column, title }: { column: Column<DataTableFeatures, TData, TValue>; title: string }) {
  if (!column.getCanSort()) return <>{title}</>
  const sorted = column.getIsSorted()
  const Icon = sorted === "asc" ? ArrowUp : sorted === "desc" ? ArrowDown : ChevronsUpDown
  return (
    <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => column.toggleSorting(sorted === "asc")}>
      {title}
      <Icon />
    </Button>
  )
}

export { DataTable, DataTableColumnHeader }
