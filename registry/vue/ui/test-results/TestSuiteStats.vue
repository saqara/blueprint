<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

interface Props extends /* @vue-ignore */ HTMLAttributes {
  passed?: number
  failed?: number
  skipped?: number
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  passed: 0,
  failed: 0,
  skipped: 0,
})
</script>

<template>
  <div
    :class="cn('ml-auto flex items-center gap-2 text-xs', props.class)"
    v-bind="$attrs"
  >
    <slot>
      <span
        v-if="props.passed > 0"
        class="text-success-text"
      >
        {{ props.passed }} réussi(s)
      </span>
      <span
        v-if="props.failed > 0"
        class="text-destructive-text"
      >
        {{ props.failed }} échoué(s)
      </span>
      <span
        v-if="props.skipped > 0"
        class="text-warning-text"
      >
        {{ props.skipped }} ignoré(s)
      </span>
    </slot>
  </div>
</template>
