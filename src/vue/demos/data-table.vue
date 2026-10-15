<script setup lang="ts">
import type { ColumnDef, ColumnOrderState, ColumnVisibilityState, SortingState } from "@tanstack/vue-table"
import { computed, h, ref } from "vue"
import { Badge } from "@/registry/vue/ui/badge"
import { Button } from "@/registry/vue/ui/button"
import { DataTable, DataTableColumnHeader, DataTableColumnPicker, type DataTableFeatures } from "@/registry/vue/ui/data-table"

type Company = { siren: string; name: string; city: string; score: number }
const companies: Company[] = [
  { siren: "900 000 001", name: "Bâti Sud SAS", city: "Lyon", score: 16 },
  { siren: "900 000 002", name: "Élec Rhône", city: "Villeurbanne", score: 12 },
  { siren: "900 000 003", name: "Plomberie Dupuis", city: "Vienne", score: 18 },
]
// Columns move (handle in the header) and hide (DataTableColumnPicker) when the page binds `column-order` /
// `column-visibility`. The first column stays in place and visible; `meta.label` names a render-function header.
const columns: ColumnDef<DataTableFeatures, Company, any>[] = [
  { accessorKey: "name", header: ({ column }) => h(DataTableColumnHeader, { column, title: "Raison sociale" }),
    enableHiding: false, meta: { reorderable: false } },
  { accessorKey: "siren", header: "SIREN", enableSorting: false },
  { accessorKey: "city", header: ({ column }) => h(DataTableColumnHeader, { column, title: "Ville" }), meta: { label: "Ville" } },
  { accessorKey: "score", header: ({ column }) => h(DataTableColumnHeader, { column, title: "Note" }), meta: { label: "Note" },
    cell: ({ row }) => h(Badge, { variant: row.original.score >= 15 ? "success" : "warning" }, () => `${row.original.score}/20`) },
]
const sorting = ref<SortingState>([{ id: "name", desc: false }])
const loading = ref(false)
const opened = ref<string>()
const defaultOrder = ["name", "siren", "city", "score"]
const columnOrder = ref<ColumnOrderState>(defaultOrder)
const columnVisibility = ref<ColumnVisibilityState>({})
const changed = computed(() => columnOrder.value.join() !== defaultOrder.join() || Object.values(columnVisibility.value).includes(false))
function resetColumns() {
  columnOrder.value = defaultOrder
  columnVisibility.value = {}
}
// The demo sorts client-side; a real page would pass `sorting` to its API.
const data = computed(() => {
  const [s] = sorting.value
  if (!s) return companies
  const key = s.id as keyof Company
  return [...companies].sort((a, b) => String(a[key]).localeCompare(String(b[key]), "fr", { numeric: true }) * (s.desc ? -1 : 1))
})
</script>

<template>
  <div class="space-y-2">
    <div class="flex justify-between gap-2">
      <Button variant="outline" size="sm" @click="loading = !loading">{{ loading ? "Afficher les données" : "Simuler le chargement" }}</Button>
      <DataTableColumnPicker v-model:column-visibility="columnVisibility" :columns="columns" :on-reset="changed ? resetColumns : undefined" />
    </div>
    <DataTable v-model:sorting="sorting" v-model:column-order="columnOrder" v-model:column-visibility="columnVisibility" :columns="columns" :data="data" :get-row-id="(c) => c.siren" :loading="loading"
      sticky-header sticky-first-column class="max-h-72"
      :on-row-click="(c: Company) => (opened = c.name)" :get-row-props="(c: Company) => ({ 'data-siren': c.siren })" />
    <p class="text-sm text-muted-foreground">{{ opened ? `Fiche ouverte : ${opened}` : "Cliquez sur une ligne pour ouvrir la fiche." }}</p>
  </div>
</template>
