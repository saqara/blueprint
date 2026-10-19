"use client"

import * as React from "react"
import { cn } from "cn"
import { MoreHorizontalIcon } from "lucide-react"
import { Badge } from "@/registry/react/ui/badge"
import { Button } from "@/registry/react/ui/button"
import { Card, CardContent } from "@/registry/react/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/registry/react/ui/dropdown-menu"
import { PageHeader } from "@/registry/react/ui/page-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/registry/react/ui/tabs"

export type RecordTab = {
  value: string
  label: string
  /** Shown after the label (contacts, documents…). */
  count?: number
  content: React.ReactNode
}

export type RecordMenuAction = {
  label: string
  icon?: React.ReactNode
  onSelect: () => void
  destructive?: boolean
}

type RecordPageProps = {
  title: React.ReactNode
  status?: { label: string; variant?: React.ComponentProps<typeof Badge>["variant"] }
  /** Short facts under the title, separated by "·" (identifier, city, trade…). */
  meta?: React.ReactNode[]
  /** Right of the title: one primary action at most (the menu holds the rest). */
  actions?: React.ReactNode
  /** Secondary actions, in the "Plus d’actions" menu. */
  menuActions?: RecordMenuAction[]
  tabs: RecordTab[]
  defaultTab?: string
  onTabChange?: (value: string) => void
  /** Key information in the side panel, as a definition list. */
  facts?: { label: string; value: React.ReactNode }[]
  asideTitle?: string
  /** More content in the side panel, under the facts. */
  aside?: React.ReactNode
  className?: string
}

// Saqara block: the detail page of one record (a company, a site, a contract). Presentational: tab panels
// and the side panel are the app's content — CollapsibleSection (headingLevel 2) fits inside a tab.
// The page has one h1 (the title); the side panel is an <aside> that moves under the tabs on small screens.
function RecordPage({
  title, status, meta = [], actions, menuActions = [], tabs, defaultTab, onTabChange, facts = [], asideTitle = "Informations clés", aside, className,
}: RecordPageProps) {
  const asideId = React.useId()
  const hasAside = facts.length > 0 || !!aside
  return (
    <div data-slot="record-page" className={cn("space-y-6", className)}>
      <PageHeader
        title={title}
        description={(status || meta.length > 0) && (
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {status && <Badge variant={status.variant ?? "secondary"}>{status.label}</Badge>}
            {meta.map((item, i) => (
              <React.Fragment key={i}>
                {(i > 0 || status) && <span aria-hidden="true">·</span>}
                <span>{item}</span>
              </React.Fragment>
            ))}
          </span>
        )}
        actions={(actions || menuActions.length > 0) && (
          <>
            {actions}
            {menuActions.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" aria-label="Plus d’actions"><MoreHorizontalIcon /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {menuActions.map((action) => (
                    <DropdownMenuItem key={action.label} variant={action.destructive ? "destructive" : "default"} onSelect={action.onSelect}>
                      {action.icon}{action.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </>
        )}
      />
      <div className={cn("grid gap-6", hasAside && "lg:grid-cols-[minmax(0,1fr)_18rem]")}>
        <Tabs defaultValue={defaultTab ?? tabs[0]?.value} onValueChange={onTabChange} className="min-w-0">
          {/* Many tabs scroll sideways on small screens instead of overflowing the page. */}
          <TabsList className="max-w-full justify-start overflow-x-auto">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="flex-none">
                {tab.label}
                {tab.count !== undefined && <Badge variant="secondary" className="px-1.5 tabular-nums">{tab.count}</Badge>}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="mt-4 space-y-4">{tab.content}</TabsContent>
          ))}
        </Tabs>
        {hasAside && (
          <aside aria-labelledby={asideId} className="min-w-0">
            <Card>
              <CardContent className="space-y-4">
                <h2 id={asideId} className="text-sm font-semibold">{asideTitle}</h2>
                {facts.length > 0 && (
                  <dl className="grid gap-3 text-sm">
                    {facts.map((fact) => (
                      <div key={fact.label} className="grid gap-0.5">
                        <dt className="text-muted-foreground">{fact.label}</dt>
                        <dd className="font-medium break-words">{fact.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                {aside}
              </CardContent>
            </Card>
          </aside>
        )}
      </div>
    </div>
  )
}

export { RecordPage }
