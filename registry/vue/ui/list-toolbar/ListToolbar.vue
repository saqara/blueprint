<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"

// Saqara: the one list toolbar — #search grows (16rem minimum), #filters keep their width,
// #actions sit right, all wrap.
const props = defineProps<{ class?: HTMLAttributes["class"] }>()
</script>

<template>
  <div data-slot="list-toolbar" :class="cn('flex flex-wrap items-center gap-3', props.class)">
    <div v-if="$slots.search" data-slot="list-toolbar-search" class="min-w-64 flex-1"><slot name="search" /></div>
    <div v-if="$slots.filters" data-slot="list-toolbar-filters" class="flex flex-wrap items-center gap-3"><slot name="filters" /></div>
    <slot />
    <div v-if="$slots.actions" data-slot="list-toolbar-actions" class="ml-auto flex flex-wrap items-center gap-2"><slot name="actions" /></div>
  </div>
</template>
