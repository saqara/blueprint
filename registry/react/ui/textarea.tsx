import * as React from "react"
import { cn } from "cn"

// Saqara: `rows` is a minimum height (field-sizing-content ignores it); `autoResize={false}` keeps a fixed height.
function Textarea({ className, rows, autoResize = true, style, ...props }: React.ComponentProps<"textarea"> & { autoResize?: boolean }) {
  return (
    <textarea
      data-slot="textarea"
      rows={rows}
      style={rows ? { minHeight: `calc(${rows}lh + 1rem + 2px)`, ...style } : style}
      className={cn(
        "flex min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:ring-destructive/40",
        autoResize && "field-sizing-content",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
