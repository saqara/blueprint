<script setup lang="ts">
import type { TooltipTriggerProps } from "reka-ui"
import { TooltipTrigger } from "reka-ui"
import { useSlots } from "vue"

// Saqara: a disabled control gets no pointer events, so its tooltip would never open (e.g. "why is this
// disabled?"). A disabled as-child child is wrapped in a focusable span that carries the trigger.
const props = defineProps<TooltipTriggerProps>()
const slots = useSlots()
function disabledChild() {
  const disabled = slots.default?.()?.[0]?.props?.disabled
  return props.asChild && disabled !== undefined && disabled !== false
}
</script>

<template>
  <TooltipTrigger
    v-if="disabledChild()"
    data-slot="tooltip-trigger"
    v-bind="props"
    as-child
  >
    <span tabindex="0" class="inline-flex w-fit rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"><slot /></span>
  </TooltipTrigger>
  <TooltipTrigger
    v-else
    data-slot="tooltip-trigger"
    v-bind="props"
  >
    <slot />
  </TooltipTrigger>
</template>
