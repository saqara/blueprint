<script setup lang="ts">
import { computed } from "vue"
import { Button } from "@/registry/vue/ui/button"
import { HoverCardTrigger } from "@/registry/vue/ui/hover-card"
import { percent, useContextValue } from "./context"
import ContextIcon from "./ContextIcon.vue"

const { usedTokens, maxTokens } = useContextValue()
const rendered = computed(() => percent(maxTokens.value ? usedTokens.value / maxTokens.value : 0))
</script>

<template>
  <HoverCardTrigger as-child>
    <slot v-if="$slots.default" />
    <Button v-else :aria-label="`Contexte utilisé : ${rendered}`" type="button" variant="ghost" v-bind="$attrs">
      <span class="font-medium text-muted-foreground">{{ rendered }}</span>
      <ContextIcon />
    </Button>
  </HoverCardTrigger>
</template>
