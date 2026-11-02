<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import type { RadarChartSeries } from "."
import { computed } from "vue"
import { cn } from "@/lib/utils"

const props = withDefaults(defineProps<{
  /** One row per axis: `{ axis: "Environnement", score: 14, secteur: 11 }`. */
  data: Array<{ axis: string } & Record<string, number | string>>
  series: RadarChartSeries[]
  /** Value at the outer ring. */
  max: number
  /** Grid rings. */
  rings?: number
  /** Names the chart for screen readers, which also get the values as a table. */
  label: string
  valueFormatter?: (value: number) => string
  class?: HTMLAttributes["class"]
}>(), { rings: 4, valueFormatter: (value: number) => String(value) })

const SIZE = 320
const R = 110
const C = SIZE / 2

// Saqara: plain SVG, no chart library. The first series is filled red, the others are outlines to
// compare with (sector average, last year). The shapes grow from the center on the spring curve.
function at(i: number, v: number) {
  const a = -Math.PI / 2 + (2 * Math.PI * i) / props.data.length
  const r = (Math.max(0, Math.min(v, props.max)) / props.max) * R
  return [C + r * Math.cos(a), C + r * Math.sin(a)] as const
}
const ring = (v: number) => props.data.map((_, i) => at(i, v).join(",")).join(" ")
const colorOf = (s: RadarChartSeries, i: number) => s.color ?? (i === 0 ? "var(--primary)" : "var(--muted-foreground)")
const valueOf = (d: Record<string, number | string>, key: string) => Number(d[key]) || 0

const shapes = computed(() => props.series.map((s, si) => {
  const points = props.data.map((d, i) => at(i, valueOf(d, s.key)))
  return { s, si, color: colorOf(s, si), points, polygon: points.map(p => p.join(",")).join(" ") }
}))
const labels = computed(() => props.data.map((d, i) => {
  const [x, y] = at(i, props.max * 1.12)
  return { axis: d.axis, x, y, anchor: Math.abs(x - C) < 1 ? "middle" : x > C ? "start" : "end" }
}))
</script>

<template>
  <figure data-slot="radar-chart" :class="cn('flex flex-col items-center gap-3', props.class)">
    <svg :viewBox="`0 0 ${SIZE} ${SIZE}`" class="w-full max-w-80 overflow-visible" aria-hidden="true">
      <g class="stroke-border" fill="none">
        <polygon v-for="k in rings" :key="k" :points="ring((max * k) / rings)" />
        <line v-for="(_, i) in data" :key="i" :x1="C" :y1="C" :x2="at(i, max)[0]" :y2="at(i, max)[1]" />
      </g>
      <g
        v-for="{ s, si, color, points, polygon } in shapes"
        :key="s.key"
        class="origin-center animate-in fade-in-0 zoom-in-0 duration-500 ease-spring"
        :style="{ animationDelay: `${si * 80}ms`, animationFillMode: 'backwards' }"
      >
        <polygon
          :points="polygon"
          :fill="si === 0 ? color : 'none'"
          :fill-opacity="0.14"
          :stroke="color"
          :stroke-width="si === 0 ? 2 : 1.5"
          :stroke-dasharray="si === 0 || s.color ? undefined : '4 3'"
          stroke-linejoin="round"
        />
        <template v-if="si === 0">
          <circle v-for="([x, y], i) in points" :key="i" :cx="x" :cy="y" r="3" fill="var(--background)" :stroke="color" stroke-width="2" />
        </template>
      </g>
      <text
        v-for="l in labels"
        :key="l.axis"
        :x="l.x"
        :y="l.y"
        :text-anchor="l.anchor"
        dominant-baseline="middle"
        class="fill-muted-foreground text-xs"
      >
        {{ l.axis }}
      </text>
    </svg>
    <figcaption class="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
      <span v-for="(s, si) in series" :key="s.key" class="inline-flex items-center gap-1.5">
        <span aria-hidden="true" :class="cn('h-0.5 w-3 rounded-full', si > 0 && !s.color && 'opacity-70')" :style="{ background: colorOf(s, si) }" />
        {{ s.label }}
      </span>
    </figcaption>
    <table class="sr-only">
      <caption>{{ label }}</caption>
      <thead><tr><th scope="col">Axe</th><th v-for="s in series" :key="s.key" scope="col">{{ s.label }}</th></tr></thead>
      <tbody>
        <tr v-for="d in data" :key="d.axis">
          <th scope="row">{{ d.axis }}</th>
          <td v-for="s in series" :key="s.key">{{ valueFormatter(valueOf(d, s.key)) }}</td>
        </tr>
      </tbody>
    </table>
  </figure>
</template>
