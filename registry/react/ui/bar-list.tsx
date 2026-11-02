"use client"

import * as React from "react"
import { cn } from "cn"
import { FluidHighlight } from "@/registry/react/lib/fluid-hover"

export type BarListItem = {
  /** Defaults to `label`. */
  key?: string
  label: string
  value: number
  /** Makes the row a link. */
  href?: string
}

type BarListProps = Omit<React.ComponentProps<"ul">, "children"> & {
  items: BarListItem[]
  /** Largest value first (default). `false` keeps the given order. */
  sort?: boolean
  valueFormatter?: (value: number) => string
}

// Saqara: a ranked breakdown, one row per item with a bar for its share of the largest value. The
// bars grow from the left on the spring curve, one after another, and glide when the data changes.
function BarList({ items, sort = true, valueFormatter = String, className, ...props }: BarListProps) {
  const rows = sort ? [...items].sort((a, b) => b.value - a.value) : items
  const top = Math.max(0, ...rows.map((r) => r.value))
  const [shown, setShown] = React.useState(false)
  React.useEffect(() => { const f = requestAnimationFrame(() => setShown(true)); return () => cancelAnimationFrame(f) }, [])

  return (
    <ul data-slot="bar-list" className={cn("relative isolate flex flex-col gap-0.5", className)} {...props}>
      <FluidHighlight as="li" mode="pointer" items="[data-slot=bar-list-row]" className="rounded-md bg-muted" />
      {rows.map((row, i) => {
        const Row = row.href ? "a" : "div"
        return (
          <li key={row.key ?? row.label}>
            <Row
              data-slot="bar-list-row"
              {...(row.href ? { href: row.href } : {})}
              className={cn(
                "flex items-center gap-3 rounded-md px-2 py-1 text-sm",
                row.href && "outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              )}
            >
              <span className="relative flex h-7 min-w-0 flex-1 items-center">
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0 rounded-sm bg-primary/12 transition-[width] duration-500 ease-spring motion-reduce:transition-none"
                  style={{ width: shown && top > 0 ? `${(row.value / top) * 100}%` : 0, transitionDelay: `${i * 30}ms` }}
                />
                <span className="relative truncate px-2">{row.label}</span>
              </span>
              <span className="shrink-0 font-medium tabular-nums">{valueFormatter(row.value)}</span>
            </Row>
          </li>
        )
      })}
    </ul>
  )
}

export { BarList }
