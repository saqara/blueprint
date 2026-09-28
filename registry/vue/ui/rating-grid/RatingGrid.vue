<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import type { RatingCriterion, RatingLevel } from "./utils"
import { computed, useId } from "vue"
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
  /** An extra choice outside the scale ("Non applicable"), after a separator. */
  outOfScale?: RatingLevel
  class?: HTMLAttributes["class"]
}>(), { scale: () => defaultScale, disabled: false, readOnly: false })
/** #criterion="{ criterion }" and #level="{ level }": custom cells (description in a tooltip, coloured digit…). */
defineSlots<{ criterion?: (props: { criterion: RatingCriterion }) => unknown, level?: (props: { level: RatingLevel }) => unknown }>()
const value = defineModel<Record<string, string>>("value", { default: () => ({}) })
const prefix = props.name ?? `rating-${useId()}`
const levels = computed(() => props.outOfScale ? [...props.scale, props.outOfScale] : props.scale)
</script>

<template>
  <!-- Below sm the same table restacks (one card per criterion, radios listed vertically with a visible
       label): one DOM, so the native radio groups never get duplicated. -->
  <div data-slot="rating-grid" :class="cn('sm:overflow-x-auto sm:rounded-md sm:border max-sm:[&_thead]:hidden max-sm:[&_table]:block max-sm:[&_tbody]:grid max-sm:[&_tbody]:gap-3 max-sm:[&_tr]:grid max-sm:[&_tr]:gap-1 max-sm:[&_tr]:rounded-md max-sm:[&_tr]:border! max-sm:[&_tr]:p-3 max-sm:[&_td]:p-1 max-sm:[&_td]:text-left max-sm:[&_caption]:block', props.class)">
  <Table :container="false">
    <TableCaption v-if="caption" class="mt-0 mb-1 caption-top px-2 pt-3 text-left font-medium text-foreground">{{ caption }}</TableCaption>
    <TableHeader>
      <TableRow>
        <TableHead>Critère</TableHead>
        <TableHead v-for="level in levels" :key="level.value" :class="cn('text-center', level === outOfScale && 'border-l')"><slot name="level" :level="level">{{ level.label }}</slot></TableHead>
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
        <TableCell v-for="level in levels" :key="level.value" :class="cn('text-center', level === outOfScale && 'sm:border-l max-sm:mt-1 max-sm:border-t max-sm:pt-2')">
          <label class="inline-flex items-center gap-2 max-sm:w-full">
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
          <span aria-hidden="true" class="text-sm sm:hidden">{{ level.label }}</span>
          </label>
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
  </div>
</template>
