<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { CollapsibleContent } from '@/registry/vue/ui/collapsible'
import { cn } from '@/lib/utils'

type ToolContentProps = InstanceType<typeof CollapsibleContent>['$props']

interface Props extends /* @vue-ignore */ ToolContentProps {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
</script>

<template>
  <CollapsibleContent
    :class="
      cn(
        'data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-1 text-popover-foreground outline-none data-[state=closed]:animate-out data-[state=open]:animate-in motion-reduce:animate-none duration-200 ease-spring data-[state=closed]:duration-120 data-[state=closed]:ease-in',
        props.class,
      )
    "
    v-bind="$attrs"
  >
    <slot />
  </CollapsibleContent>
</template>
