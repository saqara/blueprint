<script setup lang="ts">
import type { Component, HTMLAttributes } from 'vue'
import type { TestStatusType } from './context'
import {
  CheckCircle2,
  Circle,
  CircleDot,
  XCircle,
} from '@lucide/vue'
import { cn } from '@/lib/utils'
import { useTestContext } from './context'

interface Props extends /* @vue-ignore */ HTMLAttributes {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()

const { status } = useTestContext()

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
  <span
    v-if="status"
    :class="cn('shrink-0', status ? statusStyles[status] : '', props.class)"
    v-bind="$attrs"
  >
    <slot>
      <component
        :is="statusIcons[status]"
        :class="cn('size-4', status === 'running' && 'animate-pulse motion-reduce:animate-none')"
      />
      <span class="sr-only">{{ statusLabels[status] }}</span>
    </slot>
  </span>
</template>
