import * as React from "react"
import { cn } from "cn"

type SaqaraLogoProps = React.ComponentProps<"span"> & { withText?: boolean; label?: string }

// Saqara "S" mark (from signature). Red stroke = --identity, dark stroke = currentColor (readable in dark mode).
function SaqaraLogo({ withText = false, label = "Saqara", className, ...props }: SaqaraLogoProps) {
  return (
    <span data-slot="saqara-logo" className={cn("inline-flex items-center gap-2 font-heading font-semibold", className)} {...props}>
      <svg viewBox="0 0 24 24" className="size-6 shrink-0" role={withText ? undefined : "img"} aria-hidden={withText ? true : undefined} aria-label={withText ? undefined : label}>
        <path className="fill-identity" d="M13.1182 7.51609H18.2744C18.6717 6.18319 19.3093 5.11871 21.407 5.11871V0C17.646 0 13.9313 2.04564 13.1182 7.51609Z" />
        <path fill="currentColor" d="M13.1739 9.7938C9.66246 8.55346 9.13575 7.80371 9.18195 6.75775C9.21892 5.85063 10.069 5.07311 11.6862 5.1379V0.00992331C7.73118 -0.165946 4.14583 2.22217 3.94254 6.64667C3.74849 11.0341 7.00117 12.8206 10.3647 13.9314C13.756 15.0329 15.0405 15.653 14.9758 17.06C14.9388 17.9393 14.2735 18.902 11.7878 18.7816C10.0413 18.6983 8.80309 17.6616 8.6922 15.9585H3C3.78545 21.2716 7.1213 23.6875 11.3812 23.8819C16.3526 24.104 20.0027 21.6511 20.1967 17.2266C20.4185 12.3856 16.5837 10.9971 13.1739 9.7938Z" />
      </svg>
      {withText && <span>{label}</span>}
    </span>
  )
}

export { SaqaraLogo }
