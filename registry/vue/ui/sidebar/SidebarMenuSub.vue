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
    data-slot="sidebar-menu-sub"
    data-sidebar="menu-sub"
    :class="cn(
      'relative isolate border-sidebar-border mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l px-2.5 py-0.5',
      'group-data-[collapsible=icon]:hidden',
      props.class,
    )"
  >
    <FluidHighlight as="li" mode="pointer" items="[data-sidebar=menu-sub-button]" class="rounded-md bg-sidebar-accent" />
    <slot />
  </ul>
</template>
