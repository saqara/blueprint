"use client"

import * as React from "react"
import { cn } from "cn"
import { Slider as SliderPrimitive } from "radix-ui"

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  thumbLabels,
  marks,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root> & {
  /** Saqara: ticks along the track (band thresholds…), with optional labels under them. */
  marks?: { value: number; label?: string }[]
  /** Accessible name of each thumb (Radix falls back to English "Minimum" / "Maximum"). */
  thumbLabels?: string[]
}) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max]
  )

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        marks?.length && "mb-6",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          "relative grow overflow-hidden rounded-full bg-muted data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5"
        )}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            "absolute bg-primary data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
          )}
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          aria-label={thumbLabels?.[index]}
          className="block size-4 shrink-0 rounded-full border border-primary bg-white shadow-sm ring-ring/50 transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
        />
      ))}
      {marks?.length ? (
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-full mt-1 h-5 text-xs text-muted-foreground">
          {marks.map((mark) => (
            <span key={mark.value} data-slot="slider-mark" className="absolute flex -translate-x-1/2 flex-col items-center gap-0.5"
              style={{ left: `${((mark.value - min) / (max - min)) * 100}%` }}>
              <span className="h-1.5 w-px bg-border" />
              {mark.label}
            </span>
          ))}
        </div>
      ) : null}
    </SliderPrimitive.Root>
  )
}

export { Slider }
