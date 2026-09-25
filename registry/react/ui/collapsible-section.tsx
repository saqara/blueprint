"use client"

import * as React from "react"
import { cn } from "cn"
import { ChevronDownIcon } from "lucide-react"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/registry/react/ui/collapsible"

type CollapsibleSectionProps = {
  title: React.ReactNode
  /** Beside the title, outside the toggle: "Ajouter un contact", a copy button… */
  actions?: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  headingLevel?: 2 | 3 | 4
  className?: string
  children?: React.ReactNode
}

// Saqara: a titled section that folds. The heading holds the toggle button (accordion pattern);
// actions sit next to it, so no button is nested in another.
function CollapsibleSection({
  title, actions, open, defaultOpen = true, onOpenChange, headingLevel = 3, className, children,
}: CollapsibleSectionProps) {
  const Heading = `h${headingLevel}` as const
  return (
    <Collapsible data-slot="collapsible-section" open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange} className={cn("grid gap-2", className)}>
      <div className="flex min-h-9 items-center gap-2">
        <Heading className="min-w-0 flex-1 text-sm font-semibold">
          <CollapsibleTrigger className="group flex w-full items-center gap-2 rounded-md text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
            <ChevronDownIcon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=closed]:-rotate-90" />
            <span className="truncate">{title}</span>
          </CollapsibleTrigger>
        </Heading>
        {actions && <div className="flex shrink-0 items-center gap-1">{actions}</div>}
      </div>
      <CollapsibleContent>{children}</CollapsibleContent>
    </Collapsible>
  )
}

export { CollapsibleSection }
