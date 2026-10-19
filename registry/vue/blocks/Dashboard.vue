<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { computed, useId } from "vue"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader } from "@/registry/vue/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/registry/vue/ui/empty"
import { PageHeader } from "@/registry/vue/ui/page-header"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/registry/vue/ui/select"
import { Skeleton } from "@/registry/vue/ui/skeleton"
import { StatCard } from "@/registry/vue/ui/stat-card"

export interface DashboardStat { label: string, value: string | number, description?: string }
export interface DashboardPanel {
  id: string
  title: string
  description?: string
  /** Text alternative of the chart (what it shows, the key figures), read by screen readers. */
  summary: string
}
export interface DashboardActivity { id: string, title: string, description?: string, time: string, dateTime?: string }

// Saqara block: an overview screen — KPIs, chart panels, recent activity. Presentational: the app loads
// the figures for `period` and brings its charts in the #panel-<id> slots (see the chart docs for axis
// colors and keyboard use).
const props = withDefaults(defineProps<{
  title?: string
  description?: string
  /** Period selector, shown when given. */
  periods?: { value: string, label: string }[]
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
  class?: HTMLAttributes["class"]
}>(), {
  title: "Tableau de bord",
  stats: () => [],
  panels: () => [],
  activity: () => [],
  activityTitle: "Activité récente",
  emptyActivity: "Aucune activité sur la période.",
  emptyActivityHint: "Choisissez une autre période pour voir l’historique.",
  loading: false,
})

const id = useId()
const current = computed(() => props.periods?.find((p) => p.value === props.period))
const panelTitle = "font-heading leading-none font-semibold"
</script>

<template>
  <div data-slot="dashboard" :aria-busy="loading || undefined" :class="cn('space-y-6', props.class)">
    <PageHeader :title="title" :description="description">
      <template v-if="periods" #actions>
        <Select :model-value="period" @update:model-value="(v) => onPeriodChange?.(String(v))">
          <SelectTrigger aria-label="Période" class="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem v-for="p in periods" :key="p.value" :value="p.value">{{ p.label }}</SelectItem>
          </SelectContent>
        </Select>
      </template>
    </PageHeader>
    <!-- Announces a period change: every figure below changes with it. -->
    <p v-if="current" role="status" class="sr-only">Période affichée : {{ current.label }}</p>

    <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <template v-if="loading">
        <Skeleton v-for="i in stats.length || 4" :key="i" class="h-26 rounded-xl" />
      </template>
      <StatCard v-for="s in stats" v-else :key="s.label" :label="s.label" :value="s.value" :description="s.description" />
    </div>

    <div v-if="panels.length" class="grid gap-4 lg:grid-cols-2">
      <Card v-for="panel in panels" :key="panel.id" data-slot="dashboard-panel" class="min-w-0">
        <CardHeader>
          <h2 :id="`${id}-${panel.id}`" :class="panelTitle">{{ panel.title }}</h2>
          <CardDescription v-if="panel.description">{{ panel.description }}</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton v-if="loading" class="h-64 w-full" />
          <figure v-else :aria-labelledby="`${id}-${panel.id}`" class="m-0">
            <slot :name="`panel-${panel.id}`" />
            <figcaption class="sr-only">{{ panel.summary }}</figcaption>
          </figure>
        </CardContent>
      </Card>
    </div>

    <Card data-slot="dashboard-activity">
      <CardHeader><h2 :class="panelTitle">{{ activityTitle }}</h2></CardHeader>
      <CardContent>
        <div v-if="loading" class="space-y-3">
          <Skeleton v-for="i in 3" :key="i" class="h-10 w-full" />
        </div>
        <ul v-else-if="activity.length" class="divide-y">
          <li v-for="a in activity" :key="a.id" class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3 first:pt-0 last:pb-0">
            <div class="min-w-0">
              <p class="text-sm font-medium">{{ a.title }}</p>
              <p v-if="a.description" class="text-sm text-muted-foreground">{{ a.description }}</p>
            </div>
            <time :datetime="a.dateTime" class="shrink-0 text-xs text-muted-foreground">{{ a.time }}</time>
          </li>
        </ul>
        <Empty v-else class="p-6 md:p-6">
          <EmptyHeader>
            <EmptyTitle>{{ emptyActivity }}</EmptyTitle>
            <EmptyDescription>{{ emptyActivityHint }}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </CardContent>
    </Card>
  </div>
</template>
