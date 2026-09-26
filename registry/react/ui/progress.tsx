"use client"

import * as React from "react"
import { cn } from "cn"
import { Progress as ProgressPrimitive } from "radix-ui"

// Saqara: semantic colours for gauges coloured by band (scores…), track tinted to match.
const progressVariants = {
  default: { track: "bg-primary/20", indicator: "bg-primary" },
  success: { track: "bg-success/20", indicator: "bg-success" },
  warning: { track: "bg-warning/20", indicator: "bg-warning" },
  info: { track: "bg-info/20", indicator: "bg-info" },
  destructive: { track: "bg-destructive/20", indicator: "bg-destructive" },
}

function Progress({
  className,
  value,
  variant = "default",
  indicatorClassName,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & {
  variant?: keyof typeof progressVariants
  indicatorClassName?: string
}) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      data-variant={variant}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full",
        progressVariants[variant].track,
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn("h-full w-full flex-1 transition-all", progressVariants[variant].indicator, indicatorClassName)}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
