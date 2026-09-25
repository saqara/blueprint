<script setup lang="ts" generic="TData extends RowData">
import type { ColumnDef, RowData, SortingState } from "@tanstack/vue-table"
import type { HTMLAttributes } from "vue"
import { FlexRender, useTable } from "@tanstack/vue-table"
import { computed } from "vue"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/registry/vue/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/registry/vue/ui/table"
import { ariaSort, dataTableFeatures, resolveUpdater, type DataTableFeatures } from "./utils"

// Saqara: sorting is always controlled — the page sorts (server or client) and passes `sorting` back (v-model:sorting).
const props = withDefaults(defineProps<{
  // Columns mix value types, hence `any` (same as the upstream shadcn-vue data table).
  columns: ColumnDef<DataTableFeatures, TData, any>[]
  data: TData[]
  getRowId?: (row: TData, index: number) => string
  sorting?: SortingState
  loading?: boolean
  loadingRows?: number
  emptyMessage?: string
  stickyHeader?: boolean
  stickyFirstColumn?: boolean
  class?: HTMLAttributes["class"]
}>(), {
  sorting: () => [],
  loading: false,
  loadingRows: 5,
  emptyMessage: "Aucun résultat.",
  stickyHeader: false,
  stickyFirstColumn: false,
})
const emit = defineEmits<{ "update:sorting": [sorting: SortingState] }>()

const table = useTable({
  features: dataTableFeatures,
  get data() { return props.data },
  get columns() { return props.columns },
  getRowId: props.getRowId,
  manualSorting: true,
  state: { get sorting() { return props.sorting } },
  onSortingChange: (updater) => emit("update:sorting", resolveUpdater(updater, props.sorting)),
})
const colCount = computed(() => table.getAllLeafColumns().length)
const sticky = (index: number) => (props.stickyFirstColumn && index === 0 ? "sticky left-0 z-[1] bg-background" : "")
</script>

<template>
  <div
    data-slot="data-table"
    :class="cn(stickyHeader && '[&>[data-slot=table-container]]:max-h-[inherit] [&>[data-slot=table-container]]:overflow-auto', props.class)"
  >
    <Table>
      <TableHeader :class="cn(stickyHeader && 'sticky top-0 z-[2] bg-background')">
        <TableRow v-for="group in table.getHeaderGroups()" :key="group.id">
          <TableHead v-for="(header, i) in group.headers" :key="header.id" :aria-sort="ariaSort(header.column.getIsSorted())" :class="sticky(i)">
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
          <TableRow v-for="row in table.getRowModel().rows" :key="row.id">
            <TableCell v-for="(cell, i) in row.getAllCells()" :key="cell.id" :class="sticky(i)">
              <FlexRender :cell="cell" />
            </TableCell>
          </TableRow>
        </template>
        <TableRow v-else>
          <TableCell :colspan="colCount" class="h-24 text-center text-muted-foreground">{{ emptyMessage }}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
