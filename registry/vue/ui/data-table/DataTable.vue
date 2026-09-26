<script setup lang="ts" generic="TData extends RowData">
import type { ColumnDef, RowData, SortingState } from "@tanstack/vue-table"
import type { HTMLAttributes } from "vue"
import { FlexRender, useTable } from "@tanstack/vue-table"
import { computed, ref } from "vue"
import { cn } from "@/lib/utils"
import { HorizontalScroll } from "@/registry/vue/ui/horizontal-scroll"
import { Skeleton } from "@/registry/vue/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/registry/vue/ui/table"
import { ariaSort, dataTableFeatures, fromControl, metaClass, resolveUpdater, stickyCell, type DataTableFeatures } from "./utils"

// Saqara: sorting is always controlled — the page sorts (server or client) and passes `sorting` back (v-model:sorting).
const props = withDefaults(defineProps<{
  // Columns mix value types, hence `any` (same as the upstream shadcn-vue data table).
  columns: ColumnDef<DataTableFeatures, TData, any>[]
  data: TData[]
  getRowId?: (row: TData, index: number) => string
  sorting?: SortingState
  /** Live state for cells (read via `table.options.meta`), so `columns` can stay stable. */
  meta?: Record<string, unknown>
  loading?: boolean
  loadingRows?: number
  emptyMessage?: string
  stickyHeader?: boolean
  stickyFirstColumn?: boolean
  onRowClick?: (row: TData) => void
  /** Attributes for each <tr>: data-testid, class… */
  getRowProps?: (row: TData) => Record<string, unknown>
  /** Attributes for the <table>: data-testid, aria-label… */
  tableProps?: Record<string, unknown>
  /** Attributes, class and handlers for the scroll container (drag-to-scroll, scrollbar styling…). */
  scrollProps?: Record<string, unknown>
  /** false: no scroll container of its own (an outer scroller takes over; scrollProps is ignored). */
  container?: boolean
  /** false: no frame (a card frames the table). */
  bordered?: boolean
  /** Cells wrap (long messages) instead of staying on one line. */
  wrap?: boolean
  /** Wide tables: a horizontal scrollbar stuck to the bottom of the screen (see horizontal-scroll). */
  stickyScrollbar?: boolean
  /** Wide tables: drag with the mouse to scroll sideways (see horizontal-scroll). */
  dragToScroll?: boolean
  class?: HTMLAttributes["class"]
}>(), {
  sorting: () => [],
  loading: false,
  loadingRows: 5,
  emptyMessage: "Aucun résultat.",
  stickyHeader: false,
  stickyFirstColumn: false,
  container: true,
  bordered: true,
  wrap: false,
  stickyScrollbar: false,
  dragToScroll: false,
})
const emit = defineEmits<{ "update:sorting": [sorting: SortingState] }>()

const table = useTable({
  features: dataTableFeatures,
  get data() { return props.data },
  get columns() { return props.columns },
  getRowId: props.getRowId,
  get meta() { return props.meta },
  manualSorting: true,
  state: { get sorting() { return props.sorting } },
  onSortingChange: (updater) => emit("update:sorting", resolveUpdater(updater, props.sorting)),
})
const colCount = computed(() => table.getAllLeafColumns().length)
const sticky = (index: number) => (props.stickyFirstColumn && index === 0 ? stickyCell : "")

// The scroll container (drag-to-scroll, IntersectionObserver root…); the default slot renders inside it, after the table.
const scrollContainer = ref<HTMLElement | null>(null)
defineExpose({ scrollContainer })

function rowAttrs(row: TData) {
  const { class: rowClass, ...attrs } = (props.getRowProps?.(row) ?? {}) as { class?: HTMLAttributes["class"] } & Record<string, unknown>
  if (!props.onRowClick) return { ...attrs, class: rowClass }
  const onRowClick = props.onRowClick
  return {
    ...attrs,
    class: cn("cursor-pointer", rowClass),
    tabindex: 0,
    onClick: (event: MouseEvent) => { if (!fromControl(event)) onRowClick(row) },
    onKeydown: (event: KeyboardEvent) => {
      if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); onRowClick(row) }
    },
  }
}
</script>

<template>
  <div
    data-slot="data-table"
    :class="cn('[--data-table-bg:var(--background)]', stickyHeader && '[&>[data-slot=table-container]]:max-h-[inherit] [&>[data-slot=table-container]]:overflow-auto', props.class)"
  >
    <!-- Wide tables: the scroll container becomes HorizontalScroll's viewport (sticky header and scrollContainer kept). -->
    <HorizontalScroll v-if="container && (stickyScrollbar || dragToScroll)" :sticky-scrollbar="stickyScrollbar" :drag-to-scroll="dragToScroll"
      :viewport-ref="(el: HTMLElement | null) => (scrollContainer = el)" :class="cn(stickyHeader && 'max-h-[inherit]')"
      :viewport-props="{ ...scrollProps, 'data-slot': 'table-container', class: cn('relative w-full', stickyHeader && 'max-h-[inherit] overflow-auto', bordered && 'rounded-md border') }">
    <Table :container="false" :wrap="wrap" v-bind="tableProps" :aria-busy="loading || undefined">
      <TableHeader :class="cn(stickyHeader && 'sticky top-0 z-[2] bg-(--data-table-bg)')">
        <TableRow v-for="group in table.getHeaderGroups()" :key="group.id">
          <TableHead v-for="(header, i) in group.headers" :key="header.id" :aria-sort="ariaSort(header.column.getIsSorted())" :class="cn(sticky(i), metaClass(header.column.columnDef.meta))">
            <FlexRender v-if="!header.isPlaceholder" :header="header" />
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <template v-if="loading">
          <TableRow v-for="r in loadingRows" :key="`loading-${r}`" data-loading>
            <TableCell v-for="c in colCount" :key="c" :class="sticky(c - 1)"><Skeleton class="h-4 w-full" /></TableCell>
          </TableRow>
        </template>
        <template v-else-if="table.getRowModel().rows.length">
          <TableRow v-for="row in table.getRowModel().rows" :key="row.id" v-bind="rowAttrs(row.original)">
            <TableCell v-for="(cell, i) in row.getAllCells()" :key="cell.id" :class="cn(sticky(i), metaClass(cell.column.columnDef.meta))">
              <FlexRender :cell="cell" />
            </TableCell>
          </TableRow>
        </template>
        <TableRow v-else>
          <TableCell :colspan="colCount" class="h-24 text-center text-muted-foreground">{{ emptyMessage }}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
    <slot />
    </HorizontalScroll>
    <!-- container=false: display:contents, no box and no scroll of its own (an outer scroller takes over). -->
    <div v-else ref="scrollContainer" v-bind="container ? scrollProps : {}" :data-slot="container ? 'table-container' : undefined"
      :class="container ? cn('relative w-full overflow-x-auto', bordered && 'rounded-md border') : 'contents'">
    <Table :container="false" :wrap="wrap" v-bind="tableProps" :aria-busy="loading || undefined">
      <TableHeader :class="cn(stickyHeader && 'sticky top-0 z-[2] bg-(--data-table-bg)')">
        <TableRow v-for="group in table.getHeaderGroups()" :key="group.id">
          <TableHead v-for="(header, i) in group.headers" :key="header.id" :aria-sort="ariaSort(header.column.getIsSorted())" :class="cn(sticky(i), metaClass(header.column.columnDef.meta))">
            <FlexRender v-if="!header.isPlaceholder" :header="header" />
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <template v-if="loading">
          <TableRow v-for="r in loadingRows" :key="`loading-${r}`" data-loading>
            <TableCell v-for="c in colCount" :key="c" :class="sticky(c - 1)"><Skeleton class="h-4 w-full" /></TableCell>
          </TableRow>
        </template>
        <template v-else-if="table.getRowModel().rows.length">
          <TableRow v-for="row in table.getRowModel().rows" :key="row.id" v-bind="rowAttrs(row.original)">
            <TableCell v-for="(cell, i) in row.getAllCells()" :key="cell.id" :class="cn(sticky(i), metaClass(cell.column.columnDef.meta))">
              <FlexRender :cell="cell" />
            </TableCell>
          </TableRow>
        </template>
        <TableRow v-else>
          <TableCell :colspan="colCount" class="h-24 text-center text-muted-foreground">{{ emptyMessage }}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
    <slot />
    </div>
  </div>
</template>
