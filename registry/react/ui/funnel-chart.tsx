import * as React from "react"
import { cn } from "cn"

export type FunnelChartStage = {
  label: string
  value: number
}

type FunnelChartProps = Omit<React.ComponentProps<"figure">, "children"> & {
  /** In order, from the widest stage. */
  stages: FunnelChartStage[]
  /** Names the chart for screen readers. */
  label: string
  valueFormatter?: (value: number) => string
  /** Conversion between two stages (default: "42 %"). */
  percentFormatter?: (ratio: number) => string
}

const W = 120
const H = 160
const GAP = 16
const percent = new Intl.NumberFormat("fr-FR", { style: "percent", maximumFractionDigits: 0 })

// Saqara: plain SVG, no chart library. One bar per stage, sized against the first one, joined to the
// next by a tapered band; a pill on each join gives the conversion. The bars grow one after another.
// The chart keeps its height at every width (it stretches sideways), so it stays readable on a phone.
function FunnelChart({ stages, label, valueFormatter = String, percentFormatter = (r) => percent.format(r), className, ...props }: FunnelChartProps) {
  const top = Math.max(0, ...stages.map((s) => s.value))
  const h = (v: number) => (top > 0 ? Math.max(2, (v / top) * H) : 2)
  const ratio = (i: number) => (stages[i - 1].value > 0 ? stages[i].value / stages[i - 1].value : 0)

  return (
    <figure data-slot="funnel-chart" aria-label={label} className={cn("flex flex-col gap-3", className)} {...props}>
      <div className="relative">
        <svg viewBox={`0 0 ${W * stages.length} ${H}`} preserveAspectRatio="none" className="block h-40 w-full" aria-hidden="true">
          {stages.slice(1).map((s, j) => {
            const a = h(stages[j].value), b = h(s.value), x0 = (j + 1) * W - GAP / 2, x1 = x0 + GAP
            return <polygon key={j} points={`${x0},${(H - a) / 2} ${x1},${(H - b) / 2} ${x1},${(H + b) / 2} ${x0},${(H + a) / 2}`} fill="var(--primary)" fillOpacity={0.14} />
          })}
          {stages.map((s, i) => (
            <rect
              key={s.label}
              x={i * W + (i ? GAP / 2 : 0)}
              y={(H - h(s.value)) / 2}
              width={W - (i ? GAP / 2 : 0) - (i < stages.length - 1 ? GAP / 2 : 0)}
              height={h(s.value)}
              rx={6}
              fill="var(--primary)"
              fillOpacity={1 - (i / Math.max(1, stages.length)) * 0.55}
              className="origin-center animate-in fade-in-0 zoom-in-75 duration-500 ease-spring [transform-box:fill-box]"
              style={{ animationDelay: `${i * 60}ms`, animationFillMode: "backwards" }}
            />
          ))}
        </svg>
        {stages.slice(1).map((s, j) => (
          <span
            key={s.label}
            aria-hidden="true"
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border bg-background px-1.5 py-0.5 text-xs font-medium tabular-nums shadow-xs"
            style={{ left: `${((j + 1) / stages.length) * 100}%` }}
          >
            {percentFormatter(ratio(j + 1))}
          </span>
        ))}
      </div>
      <ol className="grid text-xs" style={{ gridTemplateColumns: `repeat(${stages.length}, minmax(0, 1fr))` }}>
        {stages.map((s, i) => (
          <li key={s.label} className="min-w-0 px-1">
            <div className="break-words hyphens-auto text-muted-foreground">{s.label}</div>
            <div className="text-sm font-medium tabular-nums">{valueFormatter(s.value)}</div>
            {i > 0 && <span className="sr-only">{percentFormatter(ratio(i))} de l’étape précédente</span>}
          </li>
        ))}
      </ol>
    </figure>
  )
}

export { FunnelChart }
