<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { ChevronDown, Search } from '@lucide/vue'
import {
  CollapsibleTrigger,
} from '@/registry/vue/ui/collapsible'
import { cn } from '@/lib/utils'

interface TaskTriggerProps {
  title: string
  class?: HTMLAttributes['class']
}

const props = defineProps<TaskTriggerProps>()
</script>

<template>
  <CollapsibleTrigger as-child :class="cn('group', props.class)">
    <slot>
      <!-- Saqara: a real button (upstream's div could not be reached with the keyboard). -->
      <button
        type="button"
        class="flex w-full cursor-pointer items-center gap-2 text-left text-muted-foreground text-sm transition-colors hover:text-foreground"
      >
        <Search class="size-4" />
        <span class="text-sm">{{ props.title }}</span>
        <ChevronDown
          class="size-4 transition-transform group-data-[state=open]:rotate-180"
        />
      </button>
    </slot>
  </CollapsibleTrigger>
</template>
