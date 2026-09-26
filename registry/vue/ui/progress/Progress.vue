<script setup lang="ts">
import type { ProgressRootProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import {
  ProgressIndicator,
  ProgressRoot,
} from "reka-ui"
import { cn } from "@/lib/utils"

// Saqara: semantic colours for gauges coloured by band (scores…), track tinted to match.
const variants = {
  default: { track: "bg-primary/20", indicator: "bg-primary" },
  success: { track: "bg-success/20", indicator: "bg-success" },
  warning: { track: "bg-warning/20", indicator: "bg-warning" },
  info: { track: "bg-info/20", indicator: "bg-info" },
  destructive: { track: "bg-destructive/20", indicator: "bg-destructive" },
}

const props = withDefaults(
  defineProps<ProgressRootProps & {
    class?: HTMLAttributes["class"]
    variant?: keyof typeof variants
    indicatorClass?: HTMLAttributes["class"]
  }>(),
  {
    modelValue: 0,
    variant: "default",
  },
)

const delegatedProps = reactiveOmit(props, "class", "variant", "indicatorClass")
</script>

<template>
  <ProgressRoot
    data-slot="progress"
    :data-variant="variant"
    v-bind="delegatedProps"
    :class="
      cn(
        'relative h-2 w-full overflow-hidden rounded-full',
        variants[variant].track,
        props.class,
      )
    "
  >
    <ProgressIndicator
      data-slot="progress-indicator"
:class="cn('h-full w-full flex-1 transition-all', variants[variant].indicator, indicatorClass)"
      :style="`transform: translateX(-${100 - (props.modelValue ?? 0)}%);`"
    />
  </ProgressRoot>
</template>
