<script setup lang="ts">
import type { PrimitiveProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { Primitive } from "reka-ui"
import { cn } from "@/lib/utils"

// Saqara: `as` sets the heading level (<EmptyTitle as="h2">).
const props = withDefaults(defineProps<PrimitiveProps & {
  class?: HTMLAttributes["class"]
}>(), { as: "div" })
</script>

<template>
  <Primitive
    data-slot="empty-title"
    :as="as"
    :as-child="asChild"
    :class="cn('text-lg font-medium tracking-tight', props.class)"
  >
    <slot />
  </Primitive>
</template>
