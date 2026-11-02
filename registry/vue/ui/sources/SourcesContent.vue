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
        'data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-1 outline-none data-[state=closed]:animate-out data-[state=open]:animate-in motion-reduce:animate-none duration-200 ease-spring data-[state=closed]:duration-120 data-[state=closed]:ease-in',
        props.class,
      )
    "
  >
    <slot />
  </CollapsibleContent>
</template>
