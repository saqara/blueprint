<script setup lang="ts">
import { ArrowDown, ArrowUp, ChevronsUpDown } from "@lucide/vue"
import { computed } from "vue"
import { Button } from "@/registry/vue/ui/button"
import { nextSort, type SortCycle } from "./utils"

// Structural type: `h(DataTableColumnHeader, { column })` cannot forward the row type in Vue,
// and the header only needs these three methods of a TanStack column.
type SortableColumn = {
  getCanSort: () => boolean
  getIsSorted: () => false | "asc" | "desc"
  toggleSorting: (desc?: boolean) => void
  clearSorting: () => void
}
// Attributes (data-testid, id…) go to the sort button.
defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{ column: SortableColumn; title: string; sortCycle?: SortCycle }>(), { sortCycle: "asc-desc-none" })
const icon = computed(() => {
  const sorted = props.column.getIsSorted()
  return sorted === "asc" ? ArrowUp : sorted === "desc" ? ArrowDown : ChevronsUpDown
})
function onClick() {
  const next = nextSort(props.column.getIsSorted(), props.sortCycle)
  if (next) props.column.toggleSorting(next === "desc")
  else props.column.clearSorting()
}
</script>

<template>
  <Button v-if="column.getCanSort()" v-bind="$attrs" variant="ghost" size="sm" class="-ml-3 h-8" @click="onClick">
    {{ title }}
    <component :is="icon" />
  </Button>
  <template v-else>{{ title }}</template>
</template>
