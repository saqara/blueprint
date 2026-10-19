<script setup lang="ts">
import type { ContextCosts, ContextUsage } from "./context"
import { computed, provide } from "vue"
import { HoverCard } from "@/registry/vue/ui/hover-card"
import { ContextKey } from "./context"

const props = withDefaults(defineProps<{
  usedTokens: number
  maxTokens: number
  usage?: ContextUsage
  costs?: ContextCosts
  /** ISO 4217 code of the costs. */
  currency?: string
}>(), { currency: "USD" })

provide(ContextKey, {
  usedTokens: computed(() => props.usedTokens),
  maxTokens: computed(() => props.maxTokens),
  usage: computed(() => props.usage),
  costs: computed(() => props.costs),
  currency: computed(() => props.currency),
})
</script>

<template>
  <HoverCard :close-delay="0" :open-delay="0" v-bind="$attrs">
    <slot />
  </HoverCard>
</template>
