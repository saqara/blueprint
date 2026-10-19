"use client"

import * as React from "react"
import type { ColumnDef, RowData, SortingState } from "@tanstack/react-table"
import { cn } from "cn"
import { InboxIcon, SearchIcon, SearchXIcon } from "lucide-react"
import { Button } from "@/registry/react/ui/button"
import { DataTable, type DataTableFeatures } from "@/registry/react/ui/data-table"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/registry/react/ui/empty"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/registry/react/ui/input-group"
import { ListToolbar } from "@/registry/react/ui/list-toolbar"
import { PageHeader } from "@/registry/react/ui/page-header"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/registry/react/ui/pagination"

/** Pages to show: the first, the last, and the current one with its neighbours; gaps become "…". */
export function pageItems(page: number, pageCount: number): (number | "…")[] {
  const pages = [...new Set([1, page - 1, page, page + 1, pageCount])].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b)
  return pages.flatMap((p, i) => (i > 0 && p - pages[i - 1] > 1 ? ["…" as const, p] : [p]))
}

type ListPageProps<TData extends RowData> = {
  title: React.ReactNode
  description?: React.ReactNode
  /** Header actions (one primary action at most: "Ajouter une entreprise"…). */
  actions?: React.ReactNode

  /** Search text (controlled). No search field without `onSearchChange`. */
  search?: string
  onSearchChange?: (search: string) => void
  /** Also names the field (without its "…"). */
  searchPlaceholder?: string
  /** The app's filter controls (MultiSelect, ToggleGroup…), each with its own width. */
  filters?: React.ReactNode
  /** Search or filters are active: an empty list then means "no result", with a reset button. */
  filtered?: boolean
  onReset?: () => void

  columns: ColumnDef<DataTableFeatures, TData, any>[]
  /** The current page's rows (the app filters, sorts and pages). */
  data: TData[]
  getRowId?: (row: TData, index: number) => string
  sorting?: SortingState
  onSortingChange?: (sorting: SortingState) => void
  onRowClick?: (row: TData) => void
  loading?: boolean

  /** Rows matching the search and filters, all pages together. */
  total: number
  /** 1-based. */
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  /** Counted noun, singular and plural: ["entreprise", "entreprises"]. */
  itemLabel?: [string, string]

  /** Shown when there is nothing at all yet (not filtered). */
  emptyTitle?: React.ReactNode
  emptyDescription?: React.ReactNode
  /** Under the empty state, e.g. the same "add" action as the header. */
  emptyAction?: React.ReactNode
  noResultTitle?: React.ReactNode
  noResultDescription?: React.ReactNode
  className?: string
}

// Saqara block: a list screen (header, search and filters, sortable table, pagination, empty states).
// Presentational: the app owns the data, the filtering, the sorting and the paging.
function ListPage<TData extends RowData>({
  title, description, actions, search, onSearchChange, searchPlaceholder = "Rechercher…", filters, filtered = false, onReset,
  columns, data, getRowId, sorting, onSortingChange, onRowClick, loading = false,
  total, page, pageSize, onPageChange, itemLabel = ["résultat", "résultats"],
  emptyTitle = "Aucun élément pour l’instant", emptyDescription, emptyAction,
  noResultTitle = "Aucun résultat", noResultDescription = "Aucun élément ne correspond à ces critères.", className,
}: ListPageProps<TData>) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const nothing = !loading && total === 0
  const count = `${total.toLocaleString("fr-FR")} ${itemLabel[total > 1 ? 1 : 0]}`

  return (
    <div data-slot="list-page" className={cn("space-y-6", className)}>
      <PageHeader title={title} description={description} actions={actions} />

      {/* Nothing to search in yet: no toolbar. */}
      {(!nothing || filtered) && (
        <ListToolbar
          search={onSearchChange && (
            <InputGroup>
              <InputGroupInput type="search" placeholder={searchPlaceholder} aria-label={searchPlaceholder.replace(/…$/, "")}
                value={search ?? ""} onChange={(e) => onSearchChange(e.target.value)} />
              <InputGroupAddon><SearchIcon /></InputGroupAddon>
            </InputGroup>
          )}
          filters={filters}
          actions={filtered && onReset && <Button variant="ghost" onClick={onReset}>Réinitialiser</Button>}
        />
      )}

      {/* Announced when it changes (search, filters, loading). */}
      <p data-slot="list-page-count" role="status" className={cn("text-sm text-muted-foreground", (loading || nothing) && "sr-only")}>
        {loading ? "Chargement…" : count}
      </p>

      {nothing ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">{filtered ? <SearchXIcon /> : <InboxIcon />}</EmptyMedia>
            <EmptyTitle>{filtered ? noResultTitle : emptyTitle}</EmptyTitle>
            {(filtered ? noResultDescription : emptyDescription) && <EmptyDescription>{filtered ? noResultDescription : emptyDescription}</EmptyDescription>}
          </EmptyHeader>
          {filtered
            ? onReset && <EmptyContent><Button variant="outline" onClick={onReset}>Réinitialiser les filtres</Button></EmptyContent>
            : emptyAction && <EmptyContent>{emptyAction}</EmptyContent>}
        </Empty>
      ) : (
        <DataTable columns={columns} data={data} getRowId={getRowId} sorting={sorting} onSortingChange={onSortingChange}
          onRowClick={onRowClick} loading={loading} loadingRows={Math.min(pageSize, 8)} />
      )}

      {!nothing && pageCount > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem><PaginationPrevious disabled={page <= 1} onClick={() => onPageChange(page - 1)} /></PaginationItem>
            {pageItems(page, pageCount).map((p, i) => (
              <PaginationItem key={p === "…" ? `gap-${i}` : p}>
                {p === "…" ? <PaginationEllipsis /> : (
                  <PaginationLink isActive={p === page} aria-label={`Page ${p}`} onClick={() => onPageChange(p)}>{p}</PaginationLink>
                )}
              </PaginationItem>
            ))}
            <PaginationItem><PaginationNext disabled={page >= pageCount} onClick={() => onPageChange(page + 1)} /></PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}

export { ListPage }
