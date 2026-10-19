<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { ArrowRight } from '@lucide/vue'
import { useCarousel } from '@/registry/vue/ui/carousel'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()

const { scrollNext } = useCarousel()
</script>

<template>
  <button
    :class="cn('shrink-0', props.class)"
    type="button"
    aria-label="Source suivante"
    @click="scrollNext"
  >
    <ArrowRight class="size-4 text-muted-foreground" />
  </button>
</template>
