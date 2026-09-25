<script setup lang="ts">
// Saqara: the badge is a sibling of the button, outside its accessible name: repeat the count as
// sr-only text inside SidebarMenuButton and mark the badge aria-hidden (as AppShellSidebar does).
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <div
    data-slot="sidebar-menu-badge"
    data-sidebar="menu-badge"
    :class="cn(
      'text-sidebar-foreground pointer-events-none absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums select-none',
      'peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground',
      'peer-data-[size=sm]/menu-button:top-1',
      'peer-data-[size=default]/menu-button:top-1.5',
      'peer-data-[size=lg]/menu-button:top-2.5',
      // Saqara: a dot in the icon corner when collapsed (the count stays in the entry's accessible name).
      'group-data-[collapsible=icon]:top-1 group-data-[collapsible=icon]:right-1 group-data-[collapsible=icon]:size-2 group-data-[collapsible=icon]:min-w-0 group-data-[collapsible=icon]:overflow-hidden group-data-[collapsible=icon]:rounded-full group-data-[collapsible=icon]:bg-sidebar-primary group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:text-[0px]',
      props.class,
    )"
  >
    <slot />
  </div>
</template>
