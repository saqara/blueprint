<script setup lang="ts" generic="TData extends RowData">
import type { ColumnDef, RowData, SortingState } from "@tanstack/vue-table"
import type { HTMLAttributes } from "vue"
import { InboxIcon, SearchIcon, SearchXIcon } from "@lucide/vue"
import { computed } from "vue"
import { cn } from "@/lib/utils"
import { Button } from "@/registry/vue/ui/button"
import { DataTable, type DataTableFeatures } from "@/registry/vue/ui/data-table"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/registry/vue/ui/empty"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/registry/vue/ui/input-group"
import { ListToolbar } from "@/registry/vue/ui/list-toolbar"
import { PageHeader } from "@/registry/vue/ui/page-header"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationNext, PaginationPrevious } from "@/registry/vue/ui/pagination"

// Saqara block: a list screen (header, search and filters, sortable table, pagination, empty states).
// Presentational: the app owns the data, the filtering, the sorting and the paging
// (v-model:search, v-model:sorting, v-model:page). Slots: #actions (header), #filters, #empty-action.
const props = withDefaults(defineProps<{
  title: string
  description?: string
  /** Search text (v-model:search). No search field unless it is bound. */
  search?: string
  /** Also names the field (without its "…"). */
  searchPlaceholder?: string
  /** Search or filters are active: an empty list then means "no result", with a reset button. */
  filtered?: boolean
  onReset?: () => void
  columns: ColumnDef<DataTableFeatures, TData, any>[]
  /** The current page's rows (the app filters, sorts and pages). */
  data: TData[]
  getRowId?: (row: TData, index: number) => string
  sorting?: SortingState
  onRowClick?: (row: TData) => void
  loading?: boolean
  /** Rows matching the search and filters, all pages together. */
  total: number
  /** 1-based (v-model:page). */
  page: number
  pageSize: number
  /** Counted noun, singular and plural: ["entreprise", "entreprises"]. */
  itemLabel?: [string, string]
  /** Shown when there is nothing at all yet (not filtered); #empty-action goes under it. */
  emptyTitle?: string
  emptyDescription?: string
  noResultTitle?: string
  noResultDescription?: string
  class?: HTMLAttributes["class"]
}>(), {
  search: undefined,
  searchPlaceholder: "Rechercher…",
  filtered: false,
  sorting: () => [],
  loading: false,
  itemLabel: () => ["résultat", "résultats"],
  emptyTitle: "Aucun élément pour l’instant",
  noResultTitle: "Aucun résultat",
  noResultDescription: "Aucun élément ne correspond à ces critères.",
})
const emit = defineEmits<{
  "update:search": [search: string]
  "update:sorting": [sorting: SortingState]
  "update:page": [page: number]
}>()

const pageCount = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))
const nothing = computed(() => !props.loading && props.total === 0)
const count = computed(() => `${props.total.toLocaleString("fr-FR")} ${props.itemLabel[props.total > 1 ? 1 : 0]}`)
</script>

<template>
  <div data-slot="list-page" :class="cn('space-y-6', props.class)">
    <PageHeader :title="title" :description="description">
      <template v-if="$slots.actions" #actions><slot name="actions" /></template>
    </PageHeader>

    <!-- Nothing to search in yet: no toolbar. -->
    <ListToolbar v-if="!nothing || filtered">
      <template v-if="search !== undefined" #search>
        <InputGroup>
          <InputGroupInput type="search" :placeholder="searchPlaceholder" :aria-label="searchPlaceholder.replace(/…$/, '')"
            :model-value="search" @update:model-value="emit('update:search', String($event))" />
          <InputGroupAddon><SearchIcon /></InputGroupAddon>
        </InputGroup>
      </template>
      <template v-if="$slots.filters" #filters><slot name="filters" /></template>
      <template v-if="filtered && onReset" #actions><Button variant="ghost" @click="onReset">Réinitialiser</Button></template>
    </ListToolbar>

    <!-- Announced when it changes (search, filters, loading). -->
    <p data-slot="list-page-count" role="status" :class="cn('text-sm text-muted-foreground', (loading || nothing) && 'sr-only')">
      {{ loading ? "Chargement…" : count }}
    </p>

    <Empty v-if="nothing" class="border">
      <EmptyHeader>
        <EmptyMedia variant="icon"><SearchXIcon v-if="filtered" /><InboxIcon v-else /></EmptyMedia>
        <EmptyTitle>{{ filtered ? noResultTitle : emptyTitle }}</EmptyTitle>
        <EmptyDescription v-if="filtered ? noResultDescription : emptyDescription">{{ filtered ? noResultDescription : emptyDescription }}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent v-if="filtered && onReset"><Button variant="outline" @click="onReset">Réinitialiser les filtres</Button></EmptyContent>
      <EmptyContent v-else-if="!filtered && $slots['empty-action']"><slot name="empty-action" /></EmptyContent>
    </Empty>
    <DataTable v-else :columns="columns" :data="data" :get-row-id="getRowId" :sorting="sorting" :on-row-click="onRowClick"
      :loading="loading" :loading-rows="Math.min(pageSize, 8)" @update:sorting="emit('update:sorting', $event)" />

    <Pagination v-if="!nothing && pageCount > 1" :page="page" :total="total" :items-per-page="pageSize" @update:page="emit('update:page', $event)">
      <PaginationContent v-slot="{ items }">
        <PaginationPrevious />
        <template v-for="(item, index) in items" :key="index">
          <PaginationItem v-if="item.type === 'page'" :value="item.value" :is-active="item.value === page" :aria-label="`Page ${item.value}`">
            {{ item.value }}
          </PaginationItem>
          <PaginationEllipsis v-else :index="index" />
        </template>
        <PaginationNext />
      </PaginationContent>
    </Pagination>
  </div>
</template>
