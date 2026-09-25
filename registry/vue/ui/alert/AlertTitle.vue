<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<!-- Saqara: no line-clamp — long French titles wrap instead of being cut off (opt in with class="line-clamp-1"). -->
<template>
  <div
    data-slot="alert-title"
    :class="cn('col-start-2 min-h-4 font-medium tracking-tight', props.class)"
  >
    <slot />
  </div>
</template>
