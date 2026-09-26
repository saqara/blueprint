<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import type { RatingCriterion, RatingLevel } from "./utils"
import { useId } from "vue"
import { cn } from "@/lib/utils"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/registry/vue/ui/table"
import { defaultScale, radioClass } from "./utils"

// Saqara: Likert / rating grid — one row per criterion, one native radio group per row (arrows move
// within a row, Tab moves between rows), inside a real table (no role overrides). v-model:value.
const props = withDefaults(defineProps<{
  criteria: RatingCriterion[]
  /** Columns, 0 to 5 by default. */
  scale?: RatingLevel[]
  caption?: string
  /** Prefix of the native radio names (one group per criterion). */
  name?: string
  disabled?: boolean
  /** Locked but legible (disabled = unavailable, faded). */
  readOnly?: boolean
  /** Attributes for each row: data-testid… */
  getRowProps?: (criterion: RatingCriterion) => Record<string, unknown>
  class?: HTMLAttributes["class"]
}>(), { scale: () => defaultScale, disabled: false, readOnly: false })
/** #criterion="{ criterion }" and #level="{ level }": custom cells (description in a tooltip, coloured digit…). */
defineSlots<{ criterion?: (props: { criterion: RatingCriterion }) => unknown, level?: (props: { level: RatingLevel }) => unknown }>()
const value = defineModel<Record<string, string>>("value", { default: () => ({}) })
const prefix = props.name ?? `rating-${useId()}`
</script>

<template>
  <Table data-slot="rating-grid" :class="props.class">
    <TableCaption v-if="caption" class="mt-0 mb-1 caption-top px-2 pt-3 text-left font-medium text-foreground">{{ caption }}</TableCaption>
    <TableHeader>
      <TableRow>
        <TableHead>Critère</TableHead>
        <TableHead v-for="level in scale" :key="level.value" class="text-center"><slot name="level" :level="level">{{ level.label }}</slot></TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow v-for="criterion in criteria" :key="criterion.id" v-bind="getRowProps?.(criterion)">
        <TableCell class="whitespace-normal">
          <slot name="criterion" :criterion="criterion">
            <span class="block">{{ criterion.label }}</span>
            <span v-if="criterion.description" class="block text-xs text-muted-foreground">{{ criterion.description }}</span>
          </slot>
        </TableCell>
        <TableCell v-for="level in scale" :key="level.value" class="text-center">
          <input
            type="radio"
            :name="`${prefix}-${criterion.id}`"
            :value="level.value"
            :checked="value[criterion.id] === level.value"
            :disabled="disabled || readOnly"
            :aria-label="`${criterion.label} : ${level.label}`"
            :class="cn(radioClass, 'align-middle', readOnly && 'disabled:cursor-default disabled:opacity-100')"
            @change="value = { ...value, [criterion.id]: level.value }"
          >
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
</template>
