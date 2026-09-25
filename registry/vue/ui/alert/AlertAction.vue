<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"

// Saqara: action slot of the alert (third column, top right).
const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <div data-slot="alert-action" :class="cn('col-start-3 row-start-1 -my-0.5 flex items-center gap-1 self-start justify-self-end', props.class)">
    <slot />
  </div>
</template>
