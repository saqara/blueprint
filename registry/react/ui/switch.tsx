"use client"

import * as React from "react"
import { cn } from "cn"
import { Switch as SwitchPrimitive } from "radix-ui"

function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch inline-flex shrink-0 items-center rounded-full border border-transparent shadow-xs transition-colors duration-160 ease-tail outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-[1.15rem] data-[size=default]:w-8 data-[size=sm]:h-3.5 data-[size=sm]:w-6 data-[size=default]:[--thumb:1rem] data-[size=default]:[--track:30px] data-[size=sm]:[--thumb:0.75rem] data-[size=sm]:[--track:22px] data-[state=checked]:bg-identity data-[state=unchecked]:bg-muted-foreground/70",
        className
      )}
      {...props}
    >
      {/* Saqara: --track is the inner width, so a checked thumb stretching into a pill keeps its outer edge pinned. */}
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block h-(--thumb) w-(--thumb) rounded-full bg-white shadow-sm ring-0 transition-[translate,width] duration-160 ease-tail group-hover/switch:w-[calc(var(--thumb)+2px)] group-active/switch:w-[calc(var(--thumb)+4px)] motion-reduce:transition-none data-[state=checked]:translate-x-[calc(var(--track)-100%)] data-[state=unchecked]:translate-x-0"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
