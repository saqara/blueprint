<script setup lang="ts">
import type { ColumnDef, SortingState } from "@tanstack/vue-table"
import { computed, h, ref } from "vue"
import { Badge } from "@/registry/vue/ui/badge"
import { Button } from "@/registry/vue/ui/button"
import { DataTable, DataTableColumnHeader, type DataTableFeatures } from "@/registry/vue/ui/data-table"

type Company = { siren: string; name: string; city: string; score: number }
const companies: Company[] = [
  { siren: "900 000 001", name: "Bâti Sud SAS", city: "Lyon", score: 16 },
  { siren: "900 000 002", name: "Élec Rhône", city: "Villeurbanne", score: 12 },
  { siren: "900 000 003", name: "Plomberie Dupuis", city: "Vienne", score: 18 },
]
const columns: ColumnDef<DataTableFeatures, Company, any>[] = [
  { accessorKey: "name", header: ({ column }) => h(DataTableColumnHeader, { column, title: "Raison sociale" }) },
  { accessorKey: "siren", header: "SIREN", enableSorting: false },
  { accessorKey: "city", header: ({ column }) => h(DataTableColumnHeader, { column, title: "Ville" }) },
  { accessorKey: "score", header: ({ column }) => h(DataTableColumnHeader, { column, title: "Note" }),
    cell: ({ row }) => h(Badge, { variant: row.original.score >= 15 ? "success" : "warning" }, () => `${row.original.score}/20`) },
]
const sorting = ref<SortingState>([{ id: "name", desc: false }])
const loading = ref(false)
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
    <Button variant="outline" size="sm" @click="loading = !loading">{{ loading ? "Afficher les données" : "Simuler le chargement" }}</Button>
    <DataTable v-model:sorting="sorting" :columns="columns" :data="data" :get-row-id="(c) => c.siren" :loading="loading"
      sticky-header sticky-first-column class="max-h-72 rounded-md border" />
  </div>
</template>
