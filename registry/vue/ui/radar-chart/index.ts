export { default as RadarChart } from "./RadarChart.vue"

export interface RadarChartSeries {
  key: string
  label: string
  /** CSS color. Default: `var(--primary)` for the first series, `var(--muted-foreground)` (dashed) for the others. */
  color?: string
}
