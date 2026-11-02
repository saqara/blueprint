<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import type { BarListItem } from "."
import { computed, onBeforeUnmount, onMounted, ref } from "vue"
import { cn } from "@/lib/utils"
import { FluidHighlight } from "@/registry/vue/lib/fluid-hover"

const props = withDefaults(defineProps<{
  items: BarListItem[]
  /** Largest value first (default). `false` keeps the given order. */
  sort?: boolean
  valueFormatter?: (value: number) => string
  class?: HTMLAttributes["class"]
}>(), { sort: true, valueFormatter: (value: number) => String(value) })

// Saqara: a ranked breakdown, one row per item with a bar for its share of the largest value. The
// bars grow from the left on the spring curve, one after another, and glide when the data changes.
const rows = computed(() => (props.sort ? [...props.items].sort((a, b) => b.value - a.value) : props.items))
const top = computed(() => Math.max(0, ...rows.value.map(r => r.value)))
const shown = ref(false)
let frame = 0
onMounted(() => { frame = requestAnimationFrame(() => { shown.value = true }) })
onBeforeUnmount(() => cancelAnimationFrame(frame))
</script>

<template>
  <ul data-slot="bar-list" :class="cn('relative isolate flex flex-col gap-0.5', props.class)">
    <FluidHighlight as="li" mode="pointer" items="[data-slot=bar-list-row]" class="rounded-md bg-muted" />
    <li v-for="(row, i) in rows" :key="row.key ?? row.label">
      <component
        :is="row.href ? 'a' : 'div'"
        data-slot="bar-list-row"
        :href="row.href"
        :class="cn(
          'flex items-center gap-3 rounded-md px-2 py-1 text-sm',
          row.href && 'outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        )"
      >
        <span class="relative flex h-7 min-w-0 flex-1 items-center">
          <span
            aria-hidden="true"
            class="absolute inset-y-0 left-0 rounded-sm bg-primary/12 transition-[width] duration-500 ease-spring motion-reduce:transition-none"
            :style="{ width: shown && top > 0 ? `${(row.value / top) * 100}%` : 0, transitionDelay: `${i * 30}ms` }"
          />
          <span class="relative truncate px-2">{{ row.label }}</span>
        </span>
        <span class="shrink-0 font-medium tabular-nums">{{ valueFormatter(row.value) }}</span>
      </component>
    </li>
  </ul>
</template>
