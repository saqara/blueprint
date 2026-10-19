<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"
import { money, useContextValue } from "./context"

const props = defineProps<{ class?: HTMLAttributes["class"] }>()
const { costs, currency } = useContextValue()
</script>

<template>
  <div
    v-if="$slots.default || costs?.total !== undefined"
    :class="cn('flex w-full items-center justify-between gap-3 bg-secondary p-3 text-xs', props.class)"
  >
    <slot v-if="$slots.default" />
    <template v-else>
      <span class="text-muted-foreground">Coût total</span>
      <span>{{ money(costs?.total ?? 0, currency) }}</span>
    </template>
  </div>
</template>
