<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { ChevronsUpDownIcon } from '@lucide/vue'
import { Button } from '@/registry/vue/ui/button'
import { CollapsibleTrigger } from '@/registry/vue/ui/collapsible'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <CollapsibleTrigger as-child>
    <Button
      :class="cn('size-8', props.class)"
      data-slot="plan-trigger"
      size="icon"
      variant="ghost"
    >
      <ChevronsUpDownIcon class="size-4" />
      <span class="sr-only">Afficher ou masquer le plan</span>
    </Button>
  </CollapsibleTrigger>
</template>
