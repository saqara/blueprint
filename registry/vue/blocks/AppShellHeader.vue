<script lang="ts">
import type { Component } from "vue"

export type AppNavItem = { id: string; label: string; icon?: Component; badge?: number; badgeLabel?: string; badgeVariant?: NavBadgeVariant; href?: string }
/** A count is information, not an alert: identity (brand red) by default, info or secondary for neutral counts. */
export type NavBadgeVariant = "identity" | "info" | "secondary"
export type AppUser = { name: string; email?: string; avatarUrl?: string }
</script>

<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { MenuIcon } from "@lucide/vue"
import { computed, ref } from "vue"
import { cn } from "@/lib/utils"
import { Badge } from "@/registry/vue/ui/badge"
import { Button } from "@/registry/vue/ui/button"
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
  /** Default variant of the nav badges (an item's badgeVariant wins). */
  badgeVariant?: NavBadgeVariant
  /** id of <main>, target of the built-in skip link. */
  mainId?: string
  skipLinkLabel?: string
  onNavigate?: (id: string) => void
  onSignOut?: () => void
  signOutLabel?: string
  class?: HTMLAttributes["class"]
}>(), { menuLabel: "Menu", badgeVariant: "identity", mainId: "contenu", skipLinkLabel: "Aller au contenu" })
const theme = defineModel<"light" | "dark">("theme")
const open = ref(false)
const active = computed(() => props.nav.find((item) => item.id === props.activeId))
// Nav entries: neutral sidebar-accent on hover, red tint when active (as the sidebar); they never wrap.
const entryBase = "inline-flex h-8 shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-3 text-sm font-medium outline-none transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 [&_svg]:size-4 [&_svg]:shrink-0"
const entryClass = (item: AppNavItem, mobile: boolean) =>
  cn(entryBase, item.id === props.activeId && "bg-primary/10 text-identity-text hover:bg-primary/10 hover:text-identity-text", mobile && "w-full justify-start")

function skipToMain() {
  document.getElementById(props.mainId)?.focus()
}

function go(event: Event, id: string) {
  open.value = false
  if (!props.onNavigate) return
  event.preventDefault()
  props.onNavigate(id)
}
</script>

<template>
  <div data-slot="app-shell-header" :class="cn('flex min-h-svh flex-col bg-background', props.class)">
    <!-- Skip link: moves focus to the main region without touching the URL (works with hash routers too). -->
    <a :href="`#${mainId}`" class="sr-only rounded-md bg-background px-3 py-2 text-sm font-medium shadow-md outline-none focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus-visible:ring-[3px] focus-visible:ring-ring/50" @click.prevent="skipToMain">{{ skipLinkLabel }}</a>
    <header class="sticky top-0 z-40 border-b border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div class="flex h-16 items-center gap-4 px-4 sm:px-6">
        <div class="flex shrink-0 items-center gap-2"><slot name="logo"><SaqaraLogo with-text /></slot><slot name="product" /></div>
        <!-- The active tab already names the page: the title only shows when the app passes one. -->
        <!-- Same rule as the sidebar shell: the page title is an h1 (kept for screen readers on small screens). -->
        <h1 v-if="title" class="flex shrink-0 items-center gap-2 whitespace-nowrap border-l border-sidebar-border pl-4 text-sm font-medium max-lg:sr-only">
          <component :is="active.icon" v-if="active?.icon" class="size-4 text-primary" />
          {{ title }}
        </h1>
        <nav aria-label="Navigation principale" class="ml-auto hidden min-w-0 items-center gap-1 overflow-x-auto md:flex">
          <component :is="item.href ? 'a' : 'button'" v-for="item in nav" :key="item.id" :href="item.href" :type="item.href ? undefined : 'button'"
            :aria-current="item.id === activeId ? 'page' : undefined" :class="entryClass(item, false)" @click="go($event, item.id)">
            <component :is="item.icon" v-if="item.icon" />
            {{ item.label }}
            <template v-if="item.badge">
              <Badge :variant="item.badgeVariant ?? badgeVariant" aria-hidden="true" class="ml-1 h-5 min-w-5 px-1">{{ item.badge }}</Badge>
              <span class="sr-only">{{ item.badgeLabel ?? `${item.badge} en attente` }}</span>
            </template>
          </component>
        </nav>
        <div class="ml-auto flex shrink-0 items-center gap-1 md:ml-0">
          <slot name="actions" />
          <ThemeToggle v-if="theme" v-model:theme="theme" />
          <UserMenu v-if="user" v-bind="user" :on-sign-out="onSignOut" :sign-out-label="signOutLabel" compact>
            <template v-if="$slots['user-menu']" #default><slot name="user-menu" /></template>
          </UserMenu>
          <Sheet v-model:open="open">
            <SheetTrigger as-child>
              <Button variant="ghost" size="icon" class="md:hidden" :aria-label="menuLabel"><MenuIcon /></Button>
            </SheetTrigger>
            <SheetContent side="left" class="w-72">
              <!-- A logo link inside the sheet navigates too: close it like a nav entry. -->
              <SheetHeader @click="(event: MouseEvent) => { if ((event.target as HTMLElement).closest('a')) open = false }">
                <SheetTitle class="flex items-center gap-2"><slot name="logo"><SaqaraLogo with-text /></slot><slot name="product" /></SheetTitle>
              </SheetHeader>
              <nav aria-label="Navigation principale" class="grid gap-1 px-4">
                <component :is="item.href ? 'a' : 'button'" v-for="item in nav" :key="item.id" :href="item.href" :type="item.href ? undefined : 'button'"
                  :aria-current="item.id === activeId ? 'page' : undefined" :class="entryClass(item, true)" @click="go($event, item.id)">
                  <component :is="item.icon" v-if="item.icon" />
                  {{ item.label }}
                  <template v-if="item.badge">
              <Badge :variant="item.badgeVariant ?? badgeVariant" aria-hidden="true" class="ml-1 h-5 min-w-5 px-1">{{ item.badge }}</Badge>
              <span class="sr-only">{{ item.badgeLabel ?? `${item.badge} en attente` }}</span>
            </template>
                </component>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
    <main :id="mainId" tabindex="-1" class="flex-1 p-4 outline-none sm:p-6"><slot /></main>
  </div>
</template>
