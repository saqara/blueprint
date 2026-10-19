<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { computed } from "vue"
import { Progress } from "@/registry/vue/ui/progress"
import { cn } from "@/lib/utils"
import { compact, percent, useContextValue } from "./context"

const props = defineProps<{ class?: HTMLAttributes["class"] }>()
const { usedTokens, maxTokens } = useContextValue()
const used = computed(() => (maxTokens.value ? usedTokens.value / maxTokens.value : 0))
</script>

<template>
  <div :class="cn('w-full space-y-2 p-3', props.class)">
    <slot v-if="$slots.default" />
    <template v-else>
      <div class="flex items-center justify-between gap-3 text-xs">
        <p>{{ percent(used) }}</p>
        <p class="font-mono text-muted-foreground">{{ compact(usedTokens) }} / {{ compact(maxTokens) }}</p>
      </div>
      <Progress aria-label="Contexte utilisé" class="bg-muted" :model-value="used * 100" />
    </template>
  </div>
</template>
