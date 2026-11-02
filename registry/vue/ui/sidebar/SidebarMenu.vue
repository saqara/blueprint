<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"
import { FluidHighlight } from "@/registry/vue/lib/fluid-hover"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <ul
    data-slot="sidebar-menu"
    data-sidebar="menu"
    :class="cn('relative isolate flex w-full min-w-0 flex-col gap-1', props.class)"
  >
    <FluidHighlight as="li" mode="pointer" items="[data-sidebar=menu-button]" class="rounded-md bg-sidebar-accent" />
    <slot />
  </ul>
</template>
