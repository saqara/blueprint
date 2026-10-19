<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { computed } from "vue"
import { cn } from "@/lib/utils"
import { useContextValue } from "./context"
import TokensWithCost from "./TokensWithCost.vue"

const props = defineProps<{ class?: HTMLAttributes["class"] }>()
const { usage, costs } = useContextValue()
const tokens = computed(() => usage.value?.outputTokens ?? 0)
</script>

<template>
  <slot v-if="$slots.default" />
  <div v-else-if="tokens > 0" :class="cn('flex items-center justify-between text-xs', props.class)" v-bind="$attrs">
    <span class="text-muted-foreground">Sortie</span>
    <TokensWithCost :cost="costs?.output" :tokens="tokens" />
  </div>
</template>
