"use client"

import * as React from "react"
import { cn } from "cn"
import { Card, CardContent, CardDescription, CardHeader } from "@/registry/react/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/registry/react/ui/empty"
import { PageHeader } from "@/registry/react/ui/page-header"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/registry/react/ui/select"
import { Skeleton } from "@/registry/react/ui/skeleton"
import { StatCard } from "@/registry/react/ui/stat-card"

export type DashboardStat = { label: string; value: React.ReactNode; description?: React.ReactNode; icon?: React.ReactNode }
export type DashboardPanel = {
  id: string
  title: string
  description?: string
  /** Text alternative of the chart (what it shows, the key figures), read by screen readers. */
  summary: string
  /** The app's chart (or any content). */
  content: React.ReactNode
}
export type DashboardActivity = { id: string; title: React.ReactNode; description?: React.ReactNode; time: string; dateTime?: string }

type DashboardProps = {
  title?: React.ReactNode
  description?: React.ReactNode
  /** Period selector, shown when given. */
  periods?: { value: string; label: string }[]
  period?: string
  onPeriodChange?: (period: string) => void
  stats?: DashboardStat[]
  panels?: DashboardPanel[]
  activity?: DashboardActivity[]
  activityTitle?: string
  emptyActivity?: string
  emptyActivityHint?: string
  /** Skeletons in place of the figures, charts and activity. */
  loading?: boolean
  className?: string
}

const panelTitle = "font-heading leading-none font-semibold"

// Saqara block: an overview screen — KPIs, chart panels, recent activity. Presentational: the app loads
// the figures for `period` and brings its charts (see the chart docs for axis colors and keyboard use).
function Dashboard({
  title = "Tableau de bord", description, periods, period, onPeriodChange, stats = [], panels = [], activity = [],
  activityTitle = "Activité récente", emptyActivity = "Aucune activité sur la période.", emptyActivityHint = "Choisissez une autre période pour voir l’historique.",
  loading = false, className,
}: DashboardProps) {
  const id = React.useId()
  const current = periods?.find((p) => p.value === period)

  return (
    <div data-slot="dashboard" aria-busy={loading || undefined} className={cn("space-y-6", className)}>
      <PageHeader
        title={title}
        description={description}
        actions={periods && (
          <Select value={period} onValueChange={onPeriodChange}>
            <SelectTrigger aria-label="Période" className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>{periods.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
          </Select>
        )}
      />
      {/* Announces a period change: every figure below changes with it. */}
      {current && <p role="status" className="sr-only">Période affichée : {current.label}</p>}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {loading
          ? Array.from({ length: stats.length || 4 }, (_, i) => <Skeleton key={i} className="h-26 rounded-xl" />)
          : stats.map((s) => <StatCard key={s.label} label={s.label} value={s.value} description={s.description} icon={s.icon} />)}
      </div>

      {panels.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          {panels.map((panel) => (
            <Card key={panel.id} data-slot="dashboard-panel" className="min-w-0">
              <CardHeader>
                <h2 id={`${id}-${panel.id}`} className={panelTitle}>{panel.title}</h2>
                {panel.description && <CardDescription>{panel.description}</CardDescription>}
              </CardHeader>
              <CardContent>
                {loading ? <Skeleton className="h-64 w-full" /> : (
                  <figure aria-labelledby={`${id}-${panel.id}`} className="m-0">
                    {panel.content}
                    <figcaption className="sr-only">{panel.summary}</figcaption>
                  </figure>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card data-slot="dashboard-activity">
        <CardHeader><h2 className={panelTitle}>{activityTitle}</h2></CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : activity.length ? (
            <ul className="divide-y">
              {activity.map((a) => (
                <li key={a.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{a.title}</p>
                    {a.description && <p className="text-sm text-muted-foreground">{a.description}</p>}
                  </div>
                  <time dateTime={a.dateTime} className="shrink-0 text-xs text-muted-foreground">{a.time}</time>
                </li>
              ))}
            </ul>
          ) : (
            <Empty className="p-6 md:p-6">
              <EmptyHeader>
                <EmptyTitle>{emptyActivity}</EmptyTitle>
                <EmptyDescription>{emptyActivityHint}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export { Dashboard }
