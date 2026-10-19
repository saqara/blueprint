<script setup lang="ts">
import type { Component, HTMLAttributes } from "vue"
import type { BadgeVariants } from "@/registry/vue/ui/badge"
import { MoreHorizontalIcon } from "@lucide/vue"
import { computed, useId } from "vue"
import { cn } from "@/lib/utils"
import { Badge } from "@/registry/vue/ui/badge"
import { Button } from "@/registry/vue/ui/button"
import { Card, CardContent } from "@/registry/vue/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/registry/vue/ui/dropdown-menu"
import { PageHeader } from "@/registry/vue/ui/page-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/registry/vue/ui/tabs"

export interface RecordTab {
  value: string
  label: string
  /** Shown after the label (contacts, documents…). */
  count?: number
}

export interface RecordMenuAction {
  label: string
  icon?: Component
  onSelect: () => void
  destructive?: boolean
}

// Saqara block: the detail page of one record (a company, a site, a contract). Presentational: each tab
// panel is the #tab-<value> slot, the side panel takes `facts` and the #aside slot; #actions holds one
// primary action. CollapsibleSection (heading-level 2) fits inside a tab. The page has one h1 (the title);
// the side panel is an <aside> that moves under the tabs on small screens.
const props = withDefaults(defineProps<{
  title: string
  status?: { label: string, variant?: BadgeVariants["variant"] }
  /** Short facts under the title, separated by "·" (identifier, city, trade…). */
  meta?: string[]
  /** Secondary actions, in the "Plus d’actions" menu. */
  menuActions?: RecordMenuAction[]
  tabs: RecordTab[]
  defaultTab?: string
  onTabChange?: (value: string) => void
  /** Key information in the side panel, as a definition list. */
  facts?: { label: string, value: string }[]
  asideTitle?: string
  class?: HTMLAttributes["class"]
}>(), {
  meta: () => [],
  menuActions: () => [],
  facts: () => [],
  asideTitle: "Informations clés",
})

const slots = defineSlots<Record<`tab-${string}`, () => unknown> & { actions?: () => unknown, aside?: () => unknown }>()
const asideId = useId()
const hasAside = computed(() => props.facts.length > 0 || !!slots.aside)
const hasActions = computed(() => !!slots.actions || props.menuActions.length > 0)
</script>

<template>
  <div data-slot="record-page" :class="cn('space-y-6', props.class)">
    <PageHeader :title="title">
      <template v-if="status || meta.length" #description>
        <span class="flex flex-wrap items-center gap-x-2 gap-y-1">
          <Badge v-if="status" as="span" :variant="status.variant ?? 'secondary'">{{ status.label }}</Badge>
          <template v-for="(item, i) in meta" :key="i">
            <span v-if="i > 0 || status" aria-hidden="true">·</span>
            <span>{{ item }}</span>
          </template>
        </span>
      </template>
      <template v-if="hasActions" #actions>
        <slot name="actions" />
        <DropdownMenu v-if="menuActions.length">
          <DropdownMenuTrigger as-child>
            <Button variant="outline" size="icon" aria-label="Plus d’actions"><MoreHorizontalIcon /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem v-for="action in menuActions" :key="action.label" :variant="action.destructive ? 'destructive' : 'default'" @select="action.onSelect()">
              <component :is="action.icon" v-if="action.icon" />{{ action.label }}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </template>
    </PageHeader>
    <div :class="cn('grid gap-6', hasAside && 'lg:grid-cols-[minmax(0,1fr)_18rem]')">
      <Tabs :default-value="defaultTab ?? tabs[0]?.value" class="min-w-0" @update:model-value="onTabChange?.(String($event))">
        <!-- Many tabs scroll sideways on small screens instead of overflowing the page. -->
        <TabsList class="max-w-full justify-start overflow-x-auto">
          <TabsTrigger v-for="tab in tabs" :key="tab.value" :value="tab.value" class="flex-none">
            {{ tab.label }}
            <Badge v-if="tab.count !== undefined" as="span" variant="secondary" class="px-1.5 tabular-nums">{{ tab.count }}</Badge>
          </TabsTrigger>
        </TabsList>
        <TabsContent v-for="tab in tabs" :key="tab.value" :value="tab.value" class="mt-4 space-y-4">
          <slot :name="`tab-${tab.value}`" />
        </TabsContent>
      </Tabs>
      <aside v-if="hasAside" :aria-labelledby="asideId" class="min-w-0">
        <Card>
          <CardContent class="space-y-4">
            <h2 :id="asideId" class="text-sm font-semibold">{{ asideTitle }}</h2>
            <dl v-if="facts.length" class="grid gap-3 text-sm">
              <div v-for="fact in facts" :key="fact.label" class="grid gap-0.5">
                <dt class="text-muted-foreground">{{ fact.label }}</dt>
                <dd class="font-medium break-words">{{ fact.value }}</dd>
              </div>
            </dl>
            <slot name="aside" />
          </CardContent>
        </Card>
      </aside>
    </div>
  </div>
</template>
