<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { Collapsible } from '@/registry/vue/ui/collapsible'
import { cn } from '@/lib/utils'

interface QueueSectionProps {
  defaultOpen?: boolean
  class?: HTMLAttributes['class']
}

const props = withDefaults(
  defineProps<QueueSectionProps>(),
  {
    defaultOpen: true,
  },
)
</script>

<template>
  <Collapsible
    :class="cn(props.class)"
    :default-open="props.defaultOpen"
  >
    <slot />
  </Collapsible>
</template>
