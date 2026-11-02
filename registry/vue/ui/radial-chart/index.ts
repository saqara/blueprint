export { default as RadialChart } from "./RadialChart.vue"

export interface RadialChartRing {
  key: string
  label: string
  value: number
  /** Default: the chart's `max`. */
  max?: number
  /** CSS color. Default: `var(--chart-1)`, `var(--chart-2)`… from the outer ring in. */
  color?: string
}
