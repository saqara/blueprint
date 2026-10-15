<script setup lang="ts" generic="TData extends RowData">
import type { Column, ColumnDef, ColumnOrderState, ColumnVisibilityState, Header, RowData, SortingState } from "@tanstack/vue-table"
import type { HTMLAttributes } from "vue"
import { GripVertical } from "@lucide/vue"
import { FlexRender, useTable } from "@tanstack/vue-table"
import { computed, h, ref, watch } from "vue"
import { cn } from "@/lib/utils"
import { Button } from "@/registry/vue/ui/button"
import { HorizontalScroll } from "@/registry/vue/ui/horizontal-scroll"
import { Skeleton } from "@/registry/vue/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/registry/vue/ui/table"
import { ariaSort, columnId, columnLabel, dataTableFeatures, fromControl, metaClass, moveColumn, reorderable, resolveUpdater, stickyCell, type DataTableFeatures, type LabelledColumnDef } from "./utils"

// Saqara: sorting is always controlled — the page sorts (server or client) and passes `sorting` back (v-model:sorting).
const props = withDefaults(defineProps<{
  // Columns mix value types, hence `any` (same as the upstream shadcn-vue data table).
  columns: ColumnDef<DataTableFeatures, TData, any>[]
  data: TData[]
  getRowId?: (row: TData, index: number) => string
  sorting?: SortingState
  /**
   * Column ids in display order (v-model:column-order). Passing it turns on moving columns (drag a
   * header's handle, or ←/→ on the focused handle); ids with no column are kept in place, so a
   * column shown later keeps its spot.
   */
  columnOrder?: ColumnOrderState
  /** `{ [columnId]: false }` hides a column (v-model:column-visibility, see DataTableColumnPicker). */
  columnVisibility?: ColumnVisibilityState
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
  columnOrder: undefined,
  columnVisibility: () => ({}),
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
const emit = defineEmits<{
  "update:sorting": [sorting: SortingState]
  "update:columnOrder": [columnOrder: ColumnOrderState]
  "update:columnVisibility": [columnVisibility: ColumnVisibilityState]
}>()

// TanStack would hide a column that `enableHiding: false` should keep visible (a stale stored layout…).
const columnVisibility = computed(() => {
  const alwaysVisible = new Set(props.columns.flatMap(def => (def.enableHiding === false ? [columnId(def as LabelledColumnDef)] : [])))
  return Object.fromEntries(Object.entries(props.columnVisibility).filter(([id]) => !alwaysVisible.has(id)))
})
const table = useTable({
  features: dataTableFeatures,
  get data() { return props.data },
  get columns() { return props.columns },
  getRowId: props.getRowId,
  get meta() { return props.meta },
  manualSorting: true,
  state: {
    get sorting() { return props.sorting },
    get columnOrder() { return props.columnOrder ?? [] },
    get columnVisibility() { return columnVisibility.value },
  },
  onSortingChange: updater => emit("update:sorting", resolveUpdater(updater, props.sorting)),
  onColumnVisibilityChange: updater => emit("update:columnVisibility", resolveUpdater(updater, columnVisibility.value)),
})
const colCount = computed(() => table.getVisibleLeafColumns().length)
const sticky = (index: number) => (props.stickyFirstColumn && index === 0 ? stickyCell : "")

// The scroll container (drag-to-scroll, IntersectionObserver root…); the default slot renders inside it, after the table.
const scrollContainer = ref<HTMLElement | null>(null)
defineExpose({ scrollContainer })

// Moving columns: the new order is built on `columnOrder` itself, ids with no column included.
type AnyColumn = Column<DataTableFeatures, TData, unknown>
const root = ref<HTMLElement | null>(null)
const dropTarget = ref<string | null>(null)
const announcement = ref("")
let dragging: string | null = null
let focusAfterMove: { id: string, order: string } | null = null
const label = (column: AnyColumn) => columnLabel(column.columnDef as LabelledColumnDef, column.id)
const movable = (column: AnyColumn) => props.columnOrder !== undefined && reorderable(column.columnDef.meta)
function move(id: string, target: string) {
  const order = props.columnOrder ?? []
  const ids = table.getAllLeafColumns().map(column => column.id)
  const locked = new Set(table.getAllLeafColumns().filter(column => !reorderable(column.columnDef.meta)).map(column => column.id))
  const current = [...order, ...ids.filter(column => !order.includes(column))]
  const next = moveColumn(current, id, target, locked)
  if (next === current) return null
  const visible = table.getVisibleLeafColumns()
  const position = next.filter(column => visible.some(v => v.id === column)).indexOf(id) + 1
  const column = table.getColumn(id)
  if (column) announcement.value = `${label(column)} : colonne ${position} sur ${visible.length}`
  emit("update:columnOrder", next)
  return next
}
// A moved <th> loses focus in the browser: give it back to the handle once that order is rendered
// (not on a later, unrelated change if the page refused the move).
watch(() => props.columnOrder, (columnOrder) => {
  const pending = focusAfterMove
  focusAfterMove = null
  const id = pending && pending.order === columnOrder?.join() ? pending.id : null
  if (id) [...(root.value?.querySelectorAll<HTMLElement>("[data-column-handle]") ?? [])].find(el => el.dataset.columnHandle === id)?.focus()
}, { flush: "post" })
function moveStep(id: string, step: -1 | 1) {
  const visible = table.getVisibleLeafColumns()
  const neighbour = visible[visible.findIndex(column => column.id === id) + step]
  if (!neighbour || !reorderable(neighbour.columnDef.meta)) return
  const next = move(id, neighbour.id)
  if (next) focusAfterMove = { id, order: next.join() }
}
function headAttrs(header: Header<DataTableFeatures, TData, unknown>, index: number) {
  const id = header.column.id
  return {
    "aria-sort": ariaSort(header.column.getIsSorted()),
    "data-drop-target": dropTarget.value === id || undefined,
    "class": cn(sticky(index), "data-[drop-target]:bg-muted", metaClass(header.column.columnDef.meta)),
    ...(movable(header.column) && {
      onDragover: (event: DragEvent) => {
        if (!dragging || dragging === id) return
        event.preventDefault()
        if (event.dataTransfer) event.dataTransfer.dropEffect = "move"
        dropTarget.value = id
      },
      onDragleave: () => { if (dropTarget.value === id) dropTarget.value = null },
      onDrop: (event: DragEvent) => {
        event.preventDefault()
        const from = dragging
        dragging = null
        dropTarget.value = null
        if (from && from !== id) move(from, id)
      },
    }),
  }
}
// The header's content, and the move handle after it. Inline: a text-center / text-right header class
// still aligns the title and its handle.
function HeadContent({ header }: { header: Header<DataTableFeatures, TData, unknown> }) {
  if (header.isPlaceholder) return null
  const title = h(FlexRender, { header })
  if (!movable(header.column)) return title
  const column = header.column
  // A span with role=button, not a <button>: Firefox does not start a drag from a <button>.
  // horizontal-scroll leaves [role=button] alone, so dragToScroll does not take the drag over.
  const handle = h(Button, {
    "as": "span",
    "role": "button",
    "tabindex": 0,
    "variant": "ghost",
    "size": "icon-xs",
    "draggable": "true",
    "data-column-handle": column.id,
    "aria-label": `Déplacer la colonne ${label(column)}`,
    "title": "Glisser pour déplacer, ou flèches gauche et droite",
    "class": "cursor-grab text-muted-foreground active:cursor-grabbing",
    "onDragstart": (event: DragEvent) => {
      dragging = column.id
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = "move"
        event.dataTransfer.setData("text/plain", column.id)
      }
    },
    "onDragend": () => { dragging = null; dropTarget.value = null },
    "onKeydown": (event: KeyboardEvent) => {
      const step = event.key === "ArrowLeft" ? -1 : event.key === "ArrowRight" ? 1 : 0
      if (!step) return
      event.preventDefault()
      moveStep(column.id, step)
    },
  }, () => h(GripVertical))
  return h("span", { class: "inline-flex items-center gap-0.5" }, [title, handle])
}

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
    ref="root"
    data-slot="data-table"
    :class="cn('[--data-table-bg:var(--background)]', stickyHeader && '[&>[data-slot=table-container]]:max-h-[inherit] [&>[data-slot=table-container]]:overflow-auto', props.class)"
  >
    <!-- Wide tables: the scroll container becomes HorizontalScroll's viewport (sticky header and scrollContainer kept). -->
    <HorizontalScroll v-if="container && (stickyScrollbar || dragToScroll)" :sticky-scrollbar="stickyScrollbar" :drag-to-scroll="dragToScroll"
      :viewport-ref="(el: HTMLElement | null) => (scrollContainer = el)" :class="cn(stickyHeader && 'flex max-h-[inherit] flex-col')"
      :viewport-props="{ ...scrollProps, 'data-slot': 'table-container', class: cn('relative w-full', stickyHeader && 'min-h-0 overflow-auto', bordered && 'rounded-md border') }">
    <Table :container="false" :wrap="wrap" v-bind="tableProps" :aria-busy="loading || undefined">
      <TableHeader :class="cn(stickyHeader && 'sticky top-0 z-[2] bg-(--data-table-bg)')">
        <TableRow v-for="group in table.getHeaderGroups()" :key="group.id">
          <TableHead v-for="(header, i) in group.headers" :key="header.id" v-bind="headAttrs(header, i)">
            <HeadContent :header="header" />
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
            <TableCell v-for="(cell, i) in row.getVisibleCells()" :key="cell.id" :class="cn(sticky(i), metaClass(cell.column.columnDef.meta))">
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
          <TableHead v-for="(header, i) in group.headers" :key="header.id" v-bind="headAttrs(header, i)">
            <HeadContent :header="header" />
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
            <TableCell v-for="(cell, i) in row.getVisibleCells()" :key="cell.id" :class="cn(sticky(i), metaClass(cell.column.columnDef.meta))">
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
    <span v-if="columnOrder !== undefined" role="status" aria-live="polite" class="sr-only">{{ announcement }}</span>
  </div>
</template>
