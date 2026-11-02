<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import type { FunnelChartStage } from "."
import { computed } from "vue"
import { cn } from "@/lib/utils"

const props = withDefaults(defineProps<{
  /** In order, from the widest stage. */
  stages: FunnelChartStage[]
  /** Names the chart for screen readers. */
  label: string
  valueFormatter?: (value: number) => string
  /** Conversion between two stages (default: "42 %"). */
  percentFormatter?: (ratio: number) => string
  class?: HTMLAttributes["class"]
}>(), { valueFormatter: (value: number) => String(value), percentFormatter: (ratio: number) => new Intl.NumberFormat("fr-FR", { style: "percent", maximumFractionDigits: 0 }).format(ratio) })

const W = 120
const H = 160
const GAP = 16

// Saqara: plain SVG, no chart library. One bar per stage, sized against the first one, joined to the
// next by a tapered band; a pill on each join gives the conversion. The bars grow one after another.
// The chart keeps its height at every width (it stretches sideways), so it stays readable on a phone.
const top = computed(() => Math.max(0, ...props.stages.map(s => s.value)))
const h = (v: number) => (top.value > 0 ? Math.max(2, (v / top.value) * H) : 2)
const ratio = (i: number) => (props.stages[i - 1].value > 0 ? props.stages[i].value / props.stages[i - 1].value : 0)
const n = computed(() => props.stages.length)

const bars = computed(() => props.stages.map((s, i) => ({
  label: s.label,
  x: i * W + (i ? GAP / 2 : 0),
  y: (H - h(s.value)) / 2,
  width: W - (i ? GAP / 2 : 0) - (i < n.value - 1 ? GAP / 2 : 0),
  height: h(s.value),
  opacity: 1 - (i / Math.max(1, n.value)) * 0.55,
})))
const joins = computed(() => props.stages.slice(1).map((s, j) => {
  const a = h(props.stages[j].value)
  const b = h(s.value)
  const x0 = (j + 1) * W - GAP / 2
  const x1 = x0 + GAP
  return { label: s.label, points: `${x0},${(H - a) / 2} ${x1},${(H - b) / 2} ${x1},${(H + b) / 2} ${x0},${(H + a) / 2}`, left: `${((j + 1) / n.value) * 100}%`, ratio: ratio(j + 1) }
}))
</script>

<template>
  <figure data-slot="funnel-chart" :aria-label="label" :class="cn('flex flex-col gap-3', props.class)">
    <div class="relative">
      <svg :viewBox="`0 0 ${W * n} ${H}`" preserve-aspect-ratio="none" class="block h-40 w-full" aria-hidden="true">
        <polygon v-for="j in joins" :key="j.label" :points="j.points" fill="var(--primary)" :fill-opacity="0.14" />
        <rect
          v-for="(b, i) in bars"
          :key="b.label"
          :x="b.x"
          :y="b.y"
          :width="b.width"
          :height="b.height"
          rx="6"
          fill="var(--primary)"
          :fill-opacity="b.opacity"
          class="origin-center animate-in fade-in-0 zoom-in-75 duration-500 ease-spring [transform-box:fill-box]"
          :style="{ animationDelay: `${i * 60}ms`, animationFillMode: 'backwards' }"
        />
      </svg>
      <span
        v-for="j in joins"
        :key="j.label"
        aria-hidden="true"
        class="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border bg-background px-1.5 py-0.5 text-xs font-medium tabular-nums shadow-xs"
        :style="{ left: j.left }"
      >
        {{ percentFormatter(j.ratio) }}
      </span>
    </div>
    <ol class="grid text-xs" :style="{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }">
      <li v-for="(s, i) in stages" :key="s.label" class="min-w-0 px-1">
        <div class="break-words hyphens-auto text-muted-foreground">{{ s.label }}</div>
        <div class="text-sm font-medium tabular-nums">{{ valueFormatter(s.value) }}</div>
        <span v-if="i > 0" class="sr-only">{{ percentFormatter(ratio(i)) }} de l’étape précédente</span>
      </li>
    </ol>
  </figure>
</template>
