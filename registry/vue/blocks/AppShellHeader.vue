<script lang="ts">
import type { Component } from "vue"

export type AppNavItem = { id: string; label: string; icon?: Component; badge?: number; href?: string }
export type AppUser = { name: string; email?: string; avatarUrl?: string }
</script>

<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { MenuIcon } from "@lucide/vue"
import { computed, ref } from "vue"
import { cn } from "@/lib/utils"
import { Badge } from "@/registry/vue/ui/badge"
import { Button, buttonVariants } from "@/registry/vue/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/registry/vue/ui/sheet"
import { SaqaraLogo } from "@/registry/vue/ui/saqara-logo"
import { ThemeToggle } from "@/registry/vue/ui/theme-toggle"
import { UserMenu } from "@/registry/vue/ui/user-menu"

// Saqara block: top-bar shell (pfou-hub structure). Routing-agnostic — `href` renders links, `onNavigate` (@navigate) handles clicks.
const props = withDefaults(defineProps<{
  nav: AppNavItem[]
  activeId?: string
  title?: string
  user?: AppUser
  menuLabel?: string
  onNavigate?: (id: string) => void
  onSignOut?: () => void
  class?: HTMLAttributes["class"]
}>(), { menuLabel: "Menu" })
const theme = defineModel<"light" | "dark">("theme")
const open = ref(false)
const active = computed(() => props.nav.find((item) => item.id === props.activeId))
const entryClass = (item: AppNavItem, mobile: boolean) =>
  cn(buttonVariants({ variant: item.id === props.activeId ? "secondary" : "ghost", size: "sm" }), mobile && "w-full justify-start")

function go(event: Event, id: string) {
  open.value = false
  if (!props.onNavigate) return
  event.preventDefault()
  props.onNavigate(id)
}
</script>

<template>
  <div data-slot="app-shell-header" :class="cn('flex min-h-svh flex-col bg-background', props.class)">
    <header class="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div class="flex h-16 items-center gap-4 px-4 sm:px-6">
        <slot name="logo"><SaqaraLogo with-text /></slot>
        <div v-if="title ?? active" class="hidden items-center gap-2 border-l pl-4 text-sm font-medium md:flex">
          <component :is="active.icon" v-if="active?.icon" class="size-4 text-primary" />
          {{ title ?? active?.label }}
        </div>
        <nav aria-label="Navigation principale" class="ml-auto hidden items-center gap-1 md:flex">
          <component :is="item.href ? 'a' : 'button'" v-for="item in nav" :key="item.id" :href="item.href" :type="item.href ? undefined : 'button'"
            :aria-current="item.id === activeId ? 'page' : undefined" :class="entryClass(item, false)" @click="go($event, item.id)">
            <component :is="item.icon" v-if="item.icon" />
            {{ item.label }}
            <Badge v-if="item.badge" variant="identity" class="ml-1 h-5 min-w-5 px-1">{{ item.badge }}</Badge>
          </component>
        </nav>
        <div class="ml-auto flex items-center gap-1 md:ml-0">
          <ThemeToggle v-if="theme" v-model:theme="theme" />
          <UserMenu v-if="user" v-bind="user" :on-sign-out="onSignOut" compact>
            <template v-if="$slots['user-menu']" #default><slot name="user-menu" /></template>
          </UserMenu>
          <Sheet v-model:open="open">
            <SheetTrigger as-child>
              <Button variant="ghost" size="icon" class="md:hidden" :aria-label="menuLabel"><MenuIcon /></Button>
            </SheetTrigger>
            <SheetContent side="left" class="w-72">
              <SheetHeader><SheetTitle><slot name="logo"><SaqaraLogo with-text /></slot></SheetTitle></SheetHeader>
              <nav aria-label="Navigation principale" class="grid gap-1 px-4">
                <component :is="item.href ? 'a' : 'button'" v-for="item in nav" :key="item.id" :href="item.href" :type="item.href ? undefined : 'button'"
                  :aria-current="item.id === activeId ? 'page' : undefined" :class="entryClass(item, true)" @click="go($event, item.id)">
                  <component :is="item.icon" v-if="item.icon" />
                  {{ item.label }}
                  <Badge v-if="item.badge" variant="identity" class="ml-1 h-5 min-w-5 px-1">{{ item.badge }}</Badge>
                </component>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
    <main class="flex-1 p-4 sm:p-6"><slot /></main>
  </div>
</template>
