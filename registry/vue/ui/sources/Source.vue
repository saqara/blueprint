<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { BookIcon } from '@lucide/vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  href: string
  title: string
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <a
    :class="cn('flex items-center gap-2', props.class)"
    :href="props.href"
    rel="noreferrer"
    target="_blank"
  >
    <!-- Default slot content -->
    <slot>
      <BookIcon class="h-4 w-4" />
      <span class="block font-medium">{{ props.title }}</span>
    </slot>
    <!-- Saqara: links open a new tab, say so. -->
    <span class="sr-only"> (nouvel onglet)</span>
  </a>
</template>
