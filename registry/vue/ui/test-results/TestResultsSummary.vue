<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { CheckCircle2, Circle, XCircle } from '@lucide/vue'
import { Badge } from '@/registry/vue/ui/badge'
import { cn } from '@/lib/utils'
import { useTestResultsContext } from './context'

interface Props extends /* @vue-ignore */ HTMLAttributes {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()

const { summary } = useTestResultsContext()
</script>

<template>
  <div
    v-if="summary"
    :class="cn('flex items-center gap-3', props.class)"
    v-bind="$attrs"
  >
    <slot>
      <Badge
        class="gap-1 bg-success/10 text-success-text"
        variant="secondary"
      >
        <CheckCircle2 class="size-3" />
        {{ summary.passed }} réussi(s)
      </Badge>
      <Badge
        v-if="summary.failed > 0"
        class="gap-1 bg-destructive/10 text-destructive-text"
        variant="secondary"
      >
        <XCircle class="size-3" />
        {{ summary.failed }} échoué(s)
      </Badge>
      <Badge
        v-if="summary.skipped > 0"
        class="gap-1 bg-warning/10 text-warning-text"
        variant="secondary"
      >
        <Circle class="size-3" />
        {{ summary.skipped }} ignoré(s)
      </Badge>
    </slot>
  </div>
</template>
