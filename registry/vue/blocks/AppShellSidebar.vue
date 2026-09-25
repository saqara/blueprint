<script lang="ts">
import type { Component } from "vue"

export type AppNavItem = { id: string; label: string; icon?: Component; badge?: number; badgeLabel?: string; href?: string }
export type AppUser = { name: string; email?: string; avatarUrl?: string }

// Closes the mobile sheet on every click; prevents the link only when the app navigates itself.
export function handleNavigate(event: { preventDefault(): void }, id: string, onNavigate: ((id: string) => void) | undefined, close: () => void) {
  close()
  if (!onNavigate) return
  event.preventDefault()
  onNavigate(id)
}
</script>

<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { computed, defineComponent } from "vue"
import { Separator } from "@/registry/vue/ui/separator"
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarInset, SidebarMenu,
  SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarRail, SidebarTrigger, useSidebar,
} from "@/registry/vue/ui/sidebar"
import { SaqaraLogo } from "@/registry/vue/ui/saqara-logo"
import { ThemeToggle } from "@/registry/vue/ui/theme-toggle"
import { UserMenu } from "@/registry/vue/ui/user-menu"

// Saqara block: collapsible sidebar shell. Routing-agnostic — `href` renders links, `onNavigate` (@navigate) handles clicks.
const props = withDefaults(defineProps<{
  nav: AppNavItem[]
  activeId?: string
  title?: string
  user?: AppUser
  onNavigate?: (id: string) => void
  onSignOut?: () => void
  defaultOpen?: boolean
  class?: HTMLAttributes["class"]
}>(), { defaultOpen: true })
const theme = defineModel<"light" | "dark">("theme")
const active = computed(() => props.nav.find((item) => item.id === props.activeId))

// Renderless child of SidebarProvider: exposes the mobile-sheet closer to the nav slot.
const SidebarCloser = defineComponent((_, { slots }) => {
  const { setOpenMobile } = useSidebar()
  return () => slots.default?.({ close: () => setOpenMobile(false) })
})
</script>

<template>
  <SidebarProvider :default-open="defaultOpen" :class="props.class">
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div class="flex h-8 items-center px-1 group-data-[collapsible=icon]:justify-center">
          <slot name="logo"><SaqaraLogo with-text class="group-data-[collapsible=icon]:[&>span]:sr-only" /></slot>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarCloser v-slot="{ close }">
            <SidebarMenu>
              <SidebarMenuItem v-for="item in nav" :key="item.id">
                <SidebarMenuButton
                  :is-active="item.id === activeId"
                  :tooltip="item.label"
                  :aria-current="item.id === activeId ? 'page' : undefined"
                  :as="item.href ? 'a' : 'button'"
                  :href="item.href"
                  @click="handleNavigate($event, item.id, onNavigate, close)"
                >
                  <component :is="item.icon" v-if="item.icon" />
                  <!-- The count is shown by the badge (outside the button): its spoken context lives inside the label. -->
                  <span>{{ item.label }}<span v-if="item.badge" class="sr-only"> {{ item.badgeLabel ?? `${item.badge} en attente` }}</span></span>
                </SidebarMenuButton>
                <SidebarMenuBadge v-if="item.badge" aria-hidden="true" class="justify-center rounded-full bg-identity text-identity-foreground peer-hover/menu-button:text-identity-foreground peer-data-[active=true]/menu-button:text-identity-foreground">{{ item.badge }}</SidebarMenuBadge>
              </SidebarMenuItem>
            </SidebarMenu>
            </SidebarCloser>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter v-if="user">
        <UserMenu v-bind="user" :on-sign-out="onSignOut" class="w-full group-data-[collapsible=icon]:[&>span:last-child]:hidden">
          <template v-if="$slots['user-menu']" #default><slot name="user-menu" /></template>
        </UserMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
    <SidebarInset>
      <header class="flex h-14 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger class="-ml-1" />
        <Separator orientation="vertical" class="mr-2 data-[orientation=vertical]:h-4" />
        <component :is="active.icon" v-if="active?.icon" class="size-4 text-primary" />
        <h1 v-if="title ?? active?.label" class="text-sm font-medium">{{ title ?? active?.label }}</h1>
        <ThemeToggle v-if="theme" v-model:theme="theme" class="ml-auto" />
      </header>
      <div class="flex-1 p-4"><slot /></div>
    </SidebarInset>
  </SidebarProvider>
</template>
