<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { ChevronDownIcon } from '@lucide/vue'
import { CollapsibleTrigger } from '@/registry/vue/ui/collapsible'
import { cn } from '@/lib/utils'

const props = defineProps<{
  count: number
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <CollapsibleTrigger
    :class="cn('flex items-center gap-2', props.class)"
  >
    <slot>
      <p class="font-medium">
        {{ props.count }} {{ props.count > 1 ? 'sources utilisées' : 'source utilisée' }}
      </p>
      <ChevronDownIcon class="h-4 w-4" />
    </slot>
  </CollapsibleTrigger>
</template>
