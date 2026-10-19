<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import {
  Collapsible,
  CollapsibleTrigger,
} from '@/registry/vue/ui/collapsible'
import { cn } from '@/lib/utils'
import { useStackTraceContext } from './context'

type CollapsibleTriggerProps = InstanceType<typeof CollapsibleTrigger>['$props']

interface Props extends /* @vue-ignore */ CollapsibleTriggerProps {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()

const { isOpen, setIsOpen } = useStackTraceContext('StackTraceHeader')
</script>

<template>
  <Collapsible :open="isOpen" @update:open="setIsOpen">
    <CollapsibleTrigger as-child v-bind="$attrs">
      <!-- Saqara: the header holds the action buttons, so it stays a div; it is still focusable
           and toggles with Enter / Space (the actions stop those keys from reaching it). -->
      <div
        :class="cn(
          'flex w-full cursor-pointer items-center gap-3 p-3 text-left outline-none transition-colors hover:bg-muted/50 focus-visible:ring-[3px] focus-visible:ring-ring/50',
          props.class,
        )"
        role="button"
        tabindex="0"
        @keydown.enter.self.prevent="setIsOpen(!isOpen)"
        @keydown.space.self.prevent="setIsOpen(!isOpen)"
      >
        <slot />
      </div>
    </CollapsibleTrigger>
  </Collapsible>
</template>
