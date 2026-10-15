<script setup lang="ts">
import type { ColumnVisibilityState } from "@tanstack/vue-table"
import { Columns3 } from "@lucide/vue"
import { computed } from "vue"
import { Button } from "@/registry/vue/ui/button"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/registry/vue/ui/dropdown-menu"
import { columnId, columnLabel, type LabelledColumnDef } from "./utils"

// Show or hide columns, beside the table (a toolbar): one checkbox per column that can be hidden
// (`enableHiding: false` keeps a column out of the list). Pass the table's `columns` and the same
// v-model:column-visibility as the DataTable. `@reset` adds « Réinitialiser les colonnes »: bind it
// only when the layout differs from the default.
// Attributes (data-testid, class…) go to the trigger button.
defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{
  columns: LabelledColumnDef[]
  columnVisibility?: ColumnVisibilityState
  onReset?: () => void
  label?: string
  resetLabel?: string
}>(), {
  columnVisibility: () => ({}),
  label: "Colonnes",
  resetLabel: "Réinitialiser les colonnes",
})
const emit = defineEmits<{ "update:columnVisibility": [columnVisibility: ColumnVisibilityState] }>()
const hideable = computed(() => props.columns.flatMap((def) => {
  const id = columnId(def)
  return id && def.enableHiding !== false ? [{ id, label: columnLabel(def, id) }] : []
}))
const toggle = (id: string, checked: boolean) => emit("update:columnVisibility", { ...props.columnVisibility, [id]: checked })
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button v-bind="$attrs" variant="outline" size="sm">
        <Columns3 />
        {{ label }}
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <!-- The menu stays open: several columns are usually toggled in a row. -->
      <DropdownMenuCheckboxItem v-for="column in hideable" :key="column.id" :model-value="columnVisibility[column.id] !== false"
        @select.prevent @update:model-value="(checked: boolean) => toggle(column.id, checked)">
        {{ column.label }}
      </DropdownMenuCheckboxItem>
      <template v-if="onReset">
        <DropdownMenuSeparator />
        <DropdownMenuItem @select="onReset()">
          {{ resetLabel }}
        </DropdownMenuItem>
      </template>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
