import * as React from "react"
import { cn } from "cn"

type ListToolbarProps = React.ComponentProps<"div"> & {
  /** Takes the remaining width (16rem minimum). */
  search?: React.ReactNode
  /** Each keeps its own width (give them `className="w-48"` or so). */
  filters?: React.ReactNode
  /** Right-aligned; one primary action at most. */
  actions?: React.ReactNode
}

// Saqara: the one list toolbar — search grows, filters keep their width, actions sit right, all wrap.
function ListToolbar({ search, filters, actions, className, children, ...props }: ListToolbarProps) {
  return (
    <div data-slot="list-toolbar" className={cn("flex flex-wrap items-center gap-3", className)} {...props}>
      {search && <div data-slot="list-toolbar-search" className="min-w-64 flex-1">{search}</div>}
      {filters && <div data-slot="list-toolbar-filters" className="flex flex-wrap items-center gap-3">{filters}</div>}
      {children}
      {actions && <div data-slot="list-toolbar-actions" className="ml-auto flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export { ListToolbar }
