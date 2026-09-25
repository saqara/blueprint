<script setup lang="ts">
import type { TooltipRootEmits, TooltipRootProps } from "reka-ui"
import { TooltipRoot, useForwardPropsEmits } from "reka-ui"
import TooltipProvider from "./TooltipProvider.vue"

const props = defineProps<TooltipRootProps>()
const emits = defineEmits<TooltipRootEmits>()

const forwarded = useForwardPropsEmits(props, emits)
</script>

<!-- Saqara: each tooltip brings its own provider, so it works outside a TooltipProvider. -->
<template>
  <TooltipProvider>
    <TooltipRoot
      v-slot="slotProps"
      data-slot="tooltip"
      v-bind="forwarded"
    >
      <slot v-bind="slotProps" />
    </TooltipRoot>
  </TooltipProvider>
</template>
