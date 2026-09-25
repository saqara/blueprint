<script setup lang="ts">
import type { ChartConfig } from "@/registry/vue/ui/chart"
import { VisAxis, VisLine, VisXYContainer } from "@unovis/vue"
import { ChartContainer, ChartCrosshair, ChartLegendContent, ChartTooltip, ChartTooltipContent, componentToString } from "@/registry/vue/ui/chart"

type Point = { month: string; qualite: number; rse: number }
const data: Point[] = [
  { month: "Avr.", qualite: 14, rse: 12 },
  { month: "Mai", qualite: 15, rse: 12 },
  { month: "Juin", qualite: 15, rse: 13 },
  { month: "Juil.", qualite: 16, rse: 13 },
  { month: "Août", qualite: 16, rse: 14 },
  { month: "Sept.", qualite: 17, rse: 14 },
]
const config = {
  qualite: { label: "Note qualité", color: "var(--chart-1)" },
  rse: { label: "Note RSE", color: "var(--chart-2)" },
} satisfies ChartConfig
const x = (_: Point, i: number) => i
const colors = [config.qualite.color, config.rse.color]
</script>

<template>
  <ChartContainer :config="config" class="h-64 w-full max-w-2xl" cursor>
    <VisXYContainer :data="data" :y-domain="[0, 20]" :margin="{ left: 0, right: 12, top: 8 }">
      <VisLine :x="x" :y="[(d: Point) => d.qualite, (d: Point) => d.rse]" :color="colors" />
      <VisAxis type="x" :x="x" :num-ticks="data.length" :tick-format="(i: number) => data[i]?.month" :tick-line="false" :domain-line="false" :grid-line="false" />
      <VisAxis type="y" :num-ticks="4" :tick-line="false" :domain-line="false" />
      <ChartTooltip />
      <ChartCrosshair :template="componentToString(config, ChartTooltipContent, { labelKey: 'month' })" :color="colors" />
    </VisXYContainer>
    <ChartLegendContent />
  </ChartContainer>
</template>
