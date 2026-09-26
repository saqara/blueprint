<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { ref } from "vue"
import { cn } from "@/lib/utils"

// Saqara: `scrollProgress` shows a thin decorative bar at the top of the body, following the scroll.
const props = defineProps<{
  class?: HTMLAttributes["class"]
  scrollProgress?: boolean
}>()
const progress = ref(0)
function onScroll(event: Event) {
  if (!props.scrollProgress) return
  const el = event.currentTarget as HTMLElement
  const max = el.scrollHeight - el.clientHeight
  progress.value = max > 0 ? Math.round((el.scrollTop / max) * 100) : 0
}
</script>

<template>
  <div data-slot="sheet-body" :class="cn('min-h-0 flex-1 overflow-y-auto px-4', props.class)" @scroll="onScroll">
    <div v-if="scrollProgress" aria-hidden="true" class="sticky top-0 z-10 -mx-4 h-0.5">
      <div data-slot="sheet-scroll-progress" aria-hidden="true" class="h-full bg-primary transition-[width] duration-100" :style="{ width: `${progress}%` }" />
    </div>
    <slot />
  </div>
</template>
