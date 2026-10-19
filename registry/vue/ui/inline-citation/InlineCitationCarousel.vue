<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { Carousel } from '@/registry/vue/ui/carousel'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <Carousel :class="cn('w-full', props.class)">
    <slot />
  </Carousel>
</template>
