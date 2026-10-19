"use client"

import * as React from "react"
import { cn } from "cn"

type ShimmerProps = {
  children: string
  as?: React.ElementType
  className?: string
  /** Seconds per sweep. */
  duration?: number
  /** Width of the highlight, in px per character. */
  spread?: number
}

// Saqara: AI Elements' shimmer without motion — the Web Animations API sweeps the highlight, and
// nothing moves under prefers-reduced-motion (the text stays readable in muted-foreground).
function Shimmer({ children, as: Component = "p", className, duration = 2, spread = 2 }: ShimmerProps) {
  const ref = React.useRef<HTMLElement>(null)
  React.useEffect(() => {
    const el = ref.current
    if (!el?.animate || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return
    const animation = el.animate([{ backgroundPosition: "100% center" }, { backgroundPosition: "0% center" }], { duration: duration * 1000, iterations: Infinity, easing: "linear" })
    return () => animation.cancel()
  }, [duration])

  return (
    <Component
      ref={ref}
      data-slot="shimmer"
      className={cn(
        "relative inline-block bg-[length:250%_100%,auto] bg-clip-text text-transparent [background-position:100%_center]",
        "[--bg:linear-gradient(90deg,#0000_calc(50%-var(--spread)),var(--color-background),#0000_calc(50%+var(--spread)))] [background-repeat:no-repeat,padding-box]",
        className
      )}
      style={{
        "--spread": `${children.length * spread}px`,
        backgroundImage: "var(--bg), linear-gradient(var(--color-muted-foreground), var(--color-muted-foreground))",
      } as React.CSSProperties}
    >
      {children}
    </Component>
  )
}

export { Shimmer }
