"use client"

import * as React from "react"
import { cn } from "cn"

export type RadialChartRing = {
  key: string
  label: string
  value: number
  /** Default: the chart's `max`. */
  max?: number
  /** CSS color. Default: `var(--chart-1)`, `var(--chart-2)`… from the outer ring in. */
  color?: string
}

type RadialChartProps = Omit<React.ComponentProps<"figure">, "children"> & {
  /** From the outer ring in. */
  rings: RadialChartRing[]
  max?: number
  /** Names the chart for screen readers, which also get each ring's value. */
  label: string
  valueFormatter?: (value: number, max: number) => string
  /** Shown in the middle ("72 %", a caption). */
  children?: React.ReactNode
}

const SIZE = 120
const STROKE = 10
const GAP = 3

// Saqara: plain SVG, no chart library. Concentric rings over a muted track; each fills on the spring
// curve, one after another. A single ring with a value in the middle is a completion score.
function RadialChart({ rings, max = 100, label, valueFormatter = (v, m) => `${Math.round((v / m) * 100)} %`, children, className, ...props }: RadialChartProps) {
  const [shown, setShown] = React.useState(false)
  React.useEffect(() => { const f = requestAnimationFrame(() => setShown(true)); return () => cancelAnimationFrame(f) }, [])
  const summary = rings.map((r) => `${r.label} : ${valueFormatter(r.value, r.max ?? max)}`).join(", ")

  return (
    <figure data-slot="radial-chart" className={cn("flex flex-col items-center gap-3", className)} {...props}>
      <div className="relative w-full max-w-44">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="block w-full -rotate-90" role="img" aria-label={`${label} : ${summary}`}>
          {rings.map((r, i) => {
            const radius = SIZE / 2 - STROKE / 2 - i * (STROKE + GAP)
            const length = 2 * Math.PI * radius
            const ratio = Math.max(0, Math.min(1, r.value / (r.max ?? max)))
            const color = r.color ?? `var(--chart-${(i % 5) + 1})`
            return (
              <g key={r.key} fill="none" strokeWidth={STROKE}>
                <circle cx={SIZE / 2} cy={SIZE / 2} r={radius} stroke={color} strokeOpacity={0.14} />
                <circle
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  r={radius}
                  stroke={color}
                  strokeLinecap="round"
                  strokeDasharray={length}
                  strokeDashoffset={shown ? length * (1 - ratio) : length}
                  className="transition-[stroke-dashoffset] duration-700 ease-spring motion-reduce:transition-none"
                  style={{ transitionDelay: `${i * 80}ms` }}
                />
              </g>
            )
          })}
        </svg>
        {children && <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>}
      </div>
      {rings.length > 1 && (
        <figcaption aria-hidden="true" className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {rings.map((r, i) => (
            <span key={r.key} className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full" style={{ background: r.color ?? `var(--chart-${(i % 5) + 1})` }} />
              {r.label} <span className="font-medium text-foreground tabular-nums">{valueFormatter(r.value, r.max ?? max)}</span>
            </span>
          ))}
        </figcaption>
      )}
    </figure>
  )
}

export { RadialChart }
