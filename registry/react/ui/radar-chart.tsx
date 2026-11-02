import * as React from "react"
import { cn } from "cn"

export type RadarChartSeries = {
  key: string
  label: string
  /** CSS color. Default: `var(--primary)` for the first series, `var(--muted-foreground)` (dashed) for the others. */
  color?: string
}

type RadarChartProps = Omit<React.ComponentProps<"figure">, "children"> & {
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
}

const SIZE = 320
const R = 110
const C = SIZE / 2

// Saqara: plain SVG, no chart library. The first series is filled red, the others are outlines to
// compare with (sector average, last year). The shapes grow from the center on the spring curve.
function RadarChart({ data, series, max, rings = 4, label, valueFormatter = String, className, ...props }: RadarChartProps) {
  const n = data.length
  const at = (i: number, v: number) => {
    const a = -Math.PI / 2 + (2 * Math.PI * i) / n
    const r = (Math.max(0, Math.min(v, max)) / max) * R
    return [C + r * Math.cos(a), C + r * Math.sin(a)] as const
  }
  const ring = (v: number) => data.map((_, i) => at(i, v).join(",")).join(" ")
  const colorOf = (s: RadarChartSeries, i: number) => s.color ?? (i === 0 ? "var(--primary)" : "var(--muted-foreground)")

  return (
    <figure data-slot="radar-chart" className={cn("flex flex-col items-center gap-3", className)} {...props}>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full max-w-80 overflow-visible" aria-hidden="true">
        <g className="stroke-border" fill="none">
          {Array.from({ length: rings }, (_, k) => <polygon key={k} points={ring((max * (k + 1)) / rings)} />)}
          {data.map((_, i) => { const [x, y] = at(i, max); return <line key={i} x1={C} y1={C} x2={x} y2={y} /> })}
        </g>
        {series.map((s, si) => {
          const color = colorOf(s, si)
          const points = data.map((d, i) => at(i, Number(d[s.key]) || 0))
          return (
            <g key={s.key} className="origin-center animate-in fade-in-0 zoom-in-0 duration-500 ease-spring" style={{ animationDelay: `${si * 80}ms`, animationFillMode: "backwards" }}>
              <polygon
                points={points.map((p) => p.join(",")).join(" ")}
                fill={si === 0 ? color : "none"}
                fillOpacity={0.14}
                stroke={color}
                strokeWidth={si === 0 ? 2 : 1.5}
                strokeDasharray={si === 0 || s.color ? undefined : "4 3"}
                strokeLinejoin="round"
              />
              {si === 0 && points.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={3} fill="var(--background)" stroke={color} strokeWidth={2} />)}
            </g>
          )
        })}
        {data.map((d, i) => {
          const [x, y] = at(i, max * 1.12)
          const anchor = Math.abs(x - C) < 1 ? "middle" : x > C ? "start" : "end"
          return (
            <text key={d.axis} x={x} y={y} textAnchor={anchor} dominantBaseline="middle" className="fill-muted-foreground text-xs">
              {d.axis}
            </text>
          )
        })}
      </svg>
      <figcaption className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {series.map((s, si) => (
          <span key={s.key} className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className={cn("h-0.5 w-3 rounded-full", si > 0 && !s.color && "opacity-70")} style={{ background: colorOf(s, si) }} />
            {s.label}
          </span>
        ))}
      </figcaption>
      <table className="sr-only">
        <caption>{label}</caption>
        <thead><tr><th scope="col">Axe</th>{series.map((s) => <th key={s.key} scope="col">{s.label}</th>)}</tr></thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.axis}><th scope="row">{d.axis}</th>{series.map((s) => <td key={s.key}>{valueFormatter(Number(d[s.key]) || 0)}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}

export { RadarChart }
