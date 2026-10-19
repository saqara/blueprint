<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { Badge } from '@/registry/vue/ui/badge'
import { HoverCardTrigger } from '@/registry/vue/ui/hover-card'
import { cn } from '@/lib/utils'
import { computed } from 'vue'

const props = defineProps<{
  sources: string[]
  class?: HTMLAttributes['class']
}>()

const displayText = computed(() => {
  const firstSource = props.sources[0]
  if (!firstSource)
    return 'source inconnue'

  try {
    const hostname = new URL(firstSource).hostname
    const additionalCount = props.sources.length - 1
    return additionalCount > 0 ? `${hostname} +${additionalCount}` : hostname
  }
  catch {
    return 'source inconnue'
  }
})
</script>

<template>
  <HoverCardTrigger as-child>
    <!-- Saqara: focusable, so the hover card also opens from the keyboard. -->
    <Badge :class="cn('ml-1 rounded-full', props.class)" tabindex="0" variant="secondary">
      {{ displayText }}
    </Badge>
  </HoverCardTrigger>
</template>
