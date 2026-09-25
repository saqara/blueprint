"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

// Saqara (see tests/sonner.test.ts): no theme library, apps pass `theme` (default matches vue-sonner);
// colors come from Saqara tokens, so toasts follow the app theme either way.
const Toaster = ({ theme = "light", ...props }: ToasterProps) => {
  return (
    <Sonner
      theme={theme}
      className="toaster group"
      richColors
      toastOptions={{ classNames: { description: "text-muted-foreground!" } }}
      icons={{
        success: <CircleCheckIcon className="size-4 text-success" />,
        info: <InfoIcon className="size-4 text-info" />,
        warning: <TriangleAlertIcon className="size-4 text-warning" />,
        error: <OctagonXIcon className="size-4 text-destructive" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
          // Saqara: typed toasts tinted like Alert (icon carries the color, text stays readable).
          "--success-bg": "color-mix(in oklab, var(--success) 10%, var(--popover))",
          "--success-border": "color-mix(in oklab, var(--success) 50%, var(--popover))",
          "--success-text": "var(--popover-foreground)",
          "--info-bg": "color-mix(in oklab, var(--info) 10%, var(--popover))",
          "--info-border": "color-mix(in oklab, var(--info) 50%, var(--popover))",
          "--info-text": "var(--popover-foreground)",
          "--warning-bg": "color-mix(in oklab, var(--warning) 10%, var(--popover))",
          "--warning-border": "color-mix(in oklab, var(--warning) 50%, var(--popover))",
          "--warning-text": "var(--popover-foreground)",
          "--error-bg": "color-mix(in oklab, var(--destructive) 10%, var(--popover))",
          "--error-border": "color-mix(in oklab, var(--destructive) 50%, var(--popover))",
          "--error-text": "var(--popover-foreground)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
