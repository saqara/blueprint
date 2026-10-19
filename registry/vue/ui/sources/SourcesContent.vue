<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { CollapsibleContent } from '@/registry/vue/ui/collapsible'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <CollapsibleContent
    :class="
      cn(
        'mt-3 flex w-fit flex-col gap-2',
        'data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 outline-none data-[state=closed]:animate-out data-[state=open]:animate-in motion-reduce:animate-none',
        props.class,
      )
    "
  >
    <slot />
  </CollapsibleContent>
</template>
