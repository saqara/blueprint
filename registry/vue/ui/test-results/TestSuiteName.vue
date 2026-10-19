<script setup lang="ts">
import type { Component, HTMLAttributes } from 'vue'
import type { TestStatusType } from './context'
import {
  CheckCircle2,
  ChevronRight,
  Circle,
  CircleDot,
  XCircle,
} from '@lucide/vue'
import { CollapsibleTrigger } from '@/registry/vue/ui/collapsible'
import { cn } from '@/lib/utils'
import { useTestSuiteContext } from './context'

type TestSuiteNameProps = InstanceType<typeof CollapsibleTrigger>['$props']

interface Props extends /* @vue-ignore */ TestSuiteNameProps {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()

const context = useTestSuiteContext()

const statusStyles: Record<TestStatusType, string> = {
  passed: 'text-success-text',
  failed: 'text-destructive-text',
  skipped: 'text-warning-text',
  running: 'text-info-text',
}

const statusIcons: Record<TestStatusType, Component> = {
  passed: CheckCircle2,
  failed: XCircle,
  skipped: Circle,
  running: CircleDot,
}
// Saqara: the status icon also says its status to screen readers.
const statusLabels = { passed: "Réussi", failed: "Échoué", skipped: "Ignoré", running: "En cours" } as const
</script>

<template>
  <CollapsibleTrigger
    v-if="context"
    :class="cn(
      'group flex w-full items-center gap-2 px-4 py-3 text-left transition-colors hover:bg-muted/50',
      props.class,
    )"
    v-bind="$attrs"
  >
    <ChevronRight
      class="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-90"
    />
    <span :class="cn('shrink-0', statusStyles[context.status])">
      <component
        :is="statusIcons[context.status]"
        :class="cn('size-4', context.status === 'running' && 'animate-pulse motion-reduce:animate-none')"
      />
      <span class="sr-only">{{ statusLabels[context.status] }}</span>
    </span>
    <span class="font-medium text-sm">
      <slot>{{ context.name }}</slot>
    </span>
  </CollapsibleTrigger>
</template>
