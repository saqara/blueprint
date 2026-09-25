<script setup lang="ts">
import { ArrowDown, ArrowUp, ChevronsUpDown } from "@lucide/vue"
import { computed } from "vue"
import { Button } from "@/registry/vue/ui/button"

// Structural type: `h(DataTableColumnHeader, { column })` cannot forward the row type in Vue,
// and the header only needs these three methods of a TanStack column.
type SortableColumn = {
  getCanSort: () => boolean
  getIsSorted: () => false | "asc" | "desc"
  toggleSorting: (desc?: boolean) => void
}
const props = defineProps<{ column: SortableColumn; title: string }>()
const icon = computed(() => {
  const sorted = props.column.getIsSorted()
  return sorted === "asc" ? ArrowUp : sorted === "desc" ? ArrowDown : ChevronsUpDown
})
</script>

<template>
  <Button v-if="column.getCanSort()" variant="ghost" size="sm" class="-ml-3 h-8" @click="column.toggleSorting(column.getIsSorted() === 'asc')">
    {{ title }}
    <component :is="icon" />
  </Button>
  <template v-else>{{ title }}</template>
</template>
