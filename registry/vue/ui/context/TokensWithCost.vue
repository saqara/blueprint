<script setup lang="ts">
import { compact, money, useContextValue } from "./context"

defineProps<{ tokens?: number, cost?: number }>()
const { currency } = useContextValue()
</script>

<template>
  <span>
    {{ tokens === undefined ? "—" : compact(tokens) }}
    <span v-if="cost !== undefined" class="ml-2 text-muted-foreground">• {{ money(cost, currency) }}</span>
  </span>
</template>
