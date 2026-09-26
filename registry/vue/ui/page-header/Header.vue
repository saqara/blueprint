<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"

// Saqara: the one page / section header — title, optional line under it, #actions on the right; wraps on mobile.
const props = defineProps<{
  level: 1 | 2
  title: string
  description?: string
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <div data-slot="page-header" :data-level="level" :class="cn('flex flex-wrap items-start justify-between gap-4', props.class)">
    <div class="min-w-0">
      <component :is="level === 1 ? 'h1' : 'h2'" :class="cn('font-semibold', level === 1 ? 'text-2xl' : 'text-lg')">{{ title }}</component>
      <p v-if="description || $slots.description" class="mt-1 text-sm text-muted-foreground"><slot name="description">{{ description }}</slot></p>
    </div>
    <div v-if="$slots.actions" data-slot="page-header-actions" class="flex shrink-0 flex-wrap items-center gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>
