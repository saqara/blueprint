<script setup lang="ts">
import type { ColumnDef, SortingState } from "@tanstack/vue-table"
import { PlusIcon } from "@lucide/vue"
import { computed, h, ref } from "vue"
import ListPage from "@/registry/vue/blocks/ListPage.vue"
import { Badge } from "@/registry/vue/ui/badge"
import { Button } from "@/registry/vue/ui/button"
import { DataTableColumnHeader, type DataTableFeatures } from "@/registry/vue/ui/data-table"
import { ToggleGroup, ToggleGroupItem } from "@/registry/vue/ui/toggle-group"

type Company = { siren: string; name: string; city: string; status: "qualified" | "pending"; score: number }
const COMPANIES: Company[] = ([
  ["900 000 001", "Bâti Sud SAS", "Lyon", "qualified", 16], ["900 000 002", "Élec Rhône", "Villeurbanne", "pending", 12],
  ["900 000 003", "Plomberie Dupuis", "Vienne", "qualified", 18], ["900 000 004", "Menuiseries Alpines", "Grenoble", "qualified", 15],
  ["900 000 005", "Charpentes du Forez", "Saint-Étienne", "pending", 11], ["900 000 006", "Ain Couverture", "Bourg-en-Bresse", "qualified", 14],
  ["900 000 007", "Atelier Métal Lyonnais", "Vénissieux", "qualified", 17], ["900 000 008", "Isolation Durable", "Échirolles", "pending", 9],
  ["900 000 009", "Carrelages Marseillais", "Marseille", "qualified", 13], ["900 000 010", "Bordeaux Façades", "Bordeaux", "pending", 10],
  ["900 000 011", "Nord Terrassement", "Lille", "qualified", 14], ["900 000 012", "Paris Ascenseurs", "Paris", "qualified", 19],
  ["900 000 013", "Loire Serrurerie", "Roanne", "qualified", 13], ["900 000 014", "Dauphiné Plâtrerie", "Voiron", "pending", 11],
] as const).map(([siren, name, city, status, score]) => ({ siren, name, city, status, score }))

const columns: ColumnDef<DataTableFeatures, Company, any>[] = [
  { accessorKey: "name", header: ({ column }) => h(DataTableColumnHeader, { column, title: "Raison sociale" }), cell: ({ row }) => h("span", { class: "font-medium" }, row.original.name) },
  { accessorKey: "siren", header: "SIREN", enableSorting: false },
  { accessorKey: "city", header: ({ column }) => h(DataTableColumnHeader, { column, title: "Ville" }) },
  { accessorKey: "status", header: "Statut", enableSorting: false,
    cell: ({ row }) => row.original.status === "qualified" ? h(Badge, { variant: "success" }, () => "Qualifiée") : h(Badge, { variant: "warning" }, () => "À compléter") },
  { accessorKey: "score", header: ({ column }) => h(DataTableColumnHeader, { column, title: "Note" }), cell: ({ row }) => `${row.original.score}/20` },
]

const fold = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()
const PAGE_SIZE = 5

const search = ref("")
const status = ref("all")
const sorting = ref<SortingState>([{ id: "name", desc: false }])
const page = ref(1)
const mode = ref<"data" | "empty" | "loading">("data")

// The demo filters, sorts and pages in memory; a real page would ask its API.
const list = computed(() => {
  const q = fold(search.value.trim())
  const rows = mode.value === "data" ? COMPANIES.filter((c) => (!q || fold(c.name).includes(q)) && (status.value === "all" || c.status === status.value)) : []
  const [s] = sorting.value
  if (!s) return rows
  const key = s.id as keyof Company
  return [...rows].sort((a, b) => String(a[key]).localeCompare(String(b[key]), "fr", { numeric: true }) * (s.desc ? -1 : 1))
})
const rows = computed(() => list.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE))
const filtered = computed(() => mode.value === "data" && (!!search.value || status.value !== "all"))

function setSearch(v: string) {
  search.value = v
  page.value = 1
}
function setStatus(v: unknown) {
  if (!v) return
  status.value = String(v)
  page.value = 1
}
function setSorting(s: SortingState) {
  sorting.value = s
  page.value = 1
}
function reset() {
  search.value = ""
  status.value = "all"
  page.value = 1
}
</script>

<template>
  <div class="space-y-4 p-6">
    <ToggleGroup type="single" variant="outline" size="sm" :model-value="mode" aria-label="État de la démo"
      @update:model-value="(v) => v && (mode = v as typeof mode)">
      <ToggleGroupItem value="data">Données</ToggleGroupItem>
      <ToggleGroupItem value="empty">Liste vide</ToggleGroupItem>
      <ToggleGroupItem value="loading">Chargement</ToggleGroupItem>
    </ToggleGroup>
    <ListPage
      v-model:page="page" title="Entreprises suivies" description="Fournisseurs et sous-traitants de votre organisation."
      :search="search" search-placeholder="Rechercher une entreprise…" :filtered="filtered" :on-reset="reset"
      :columns="columns" :data="rows" :get-row-id="(c: Company) => c.siren" :sorting="sorting" :loading="mode === 'loading'"
      :total="list.length" :page-size="PAGE_SIZE" :item-label="['entreprise', 'entreprises']"
      empty-title="Aucune entreprise suivie" empty-description="Ajoutez vos fournisseurs pour suivre leurs documents et leurs évaluations."
      no-result-description="Aucune entreprise ne correspond à ces critères."
      @update:search="setSearch" @update:sorting="setSorting"
    >
      <template #actions><Button><PlusIcon />Ajouter une entreprise</Button></template>
      <template #filters>
        <ToggleGroup type="single" variant="outline" :model-value="status" aria-label="Statut" @update:model-value="setStatus">
          <ToggleGroupItem value="all">Toutes</ToggleGroupItem>
          <ToggleGroupItem value="qualified">Qualifiées</ToggleGroupItem>
          <ToggleGroupItem value="pending">À compléter</ToggleGroupItem>
        </ToggleGroup>
      </template>
      <template #empty-action><Button><PlusIcon />Ajouter une entreprise</Button></template>
    </ListPage>
  </div>
</template>
