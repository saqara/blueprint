<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import type { RadialChartRing } from "."
import { computed, onBeforeUnmount, onMounted, ref } from "vue"
import { cn } from "@/lib/utils"

const props = withDefaults(defineProps<{
  /** From the outer ring in. */
  rings: RadialChartRing[]
  max?: number
  /** Names the chart for screen readers, which also get each ring's value. */
  label: string
  valueFormatter?: (value: number, max: number) => string
  class?: HTMLAttributes["class"]
}>(), { max: 100, valueFormatter: (value: number, max: number) => `${Math.round((value / max) * 100)} %` })

const SIZE = 120
const STROKE = 10
const GAP = 3

// Saqara: plain SVG, no chart library. Concentric rings over a muted track; each fills on the spring
// curve, one after another. A single ring with a value in the middle (default slot) is a completion score.
const shown = ref(false)
let frame = 0
onMounted(() => { frame = requestAnimationFrame(() => { shown.value = true }) })
onBeforeUnmount(() => cancelAnimationFrame(frame))

const arcs = computed(() => props.rings.map((r, i) => {
  const radius = SIZE / 2 - STROKE / 2 - i * (STROKE + GAP)
  const length = 2 * Math.PI * radius
  const ringMax = r.max ?? props.max
  return {
    r,
    radius,
    length,
    ratio: Math.max(0, Math.min(1, r.value / ringMax)),
    color: r.color ?? `var(--chart-${(i % 5) + 1})`,
    text: props.valueFormatter(r.value, ringMax),
  }
}))
const summary = computed(() => arcs.value.map(a => `${a.r.label} : ${a.text}`).join(", "))
</script>

<template>
  <figure data-slot="radial-chart" :class="cn('flex flex-col items-center gap-3', props.class)">
    <div class="relative w-full max-w-44">
      <svg :viewBox="`0 0 ${SIZE} ${SIZE}`" class="block w-full -rotate-90" role="img" :aria-label="`${label} : ${summary}`">
        <g v-for="(a, i) in arcs" :key="a.r.key" fill="none" :stroke-width="STROKE">
          <circle :cx="SIZE / 2" :cy="SIZE / 2" :r="a.radius" :stroke="a.color" :stroke-opacity="0.14" />
          <circle
            :cx="SIZE / 2"
            :cy="SIZE / 2"
            :r="a.radius"
            :stroke="a.color"
            stroke-linecap="round"
            :stroke-dasharray="a.length"
            :stroke-dashoffset="shown ? a.length * (1 - a.ratio) : a.length"
            class="transition-[stroke-dashoffset] duration-700 ease-spring motion-reduce:transition-none"
            :style="{ transitionDelay: `${i * 80}ms` }"
          />
        </g>
      </svg>
      <div v-if="$slots.default" class="absolute inset-0 flex flex-col items-center justify-center text-center">
        <slot />
      </div>
    </div>
    <figcaption v-if="rings.length > 1" aria-hidden="true" class="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
      <span v-for="a in arcs" :key="a.r.key" class="inline-flex items-center gap-1.5">
        <span class="size-2 rounded-full" :style="{ background: a.color }" />
        {{ a.r.label }} <span class="font-medium text-foreground tabular-nums">{{ a.text }}</span>
      </span>
    </figcaption>
  </figure>
</template>
