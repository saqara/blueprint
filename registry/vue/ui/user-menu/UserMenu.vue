<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { LogOutIcon } from "@lucide/vue"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/registry/vue/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/registry/vue/ui/dropdown-menu"
import { initials } from "./utils"

// `onSignOut` is a prop (bind with @sign-out) so the entry only shows when the app handles it.
const props = withDefaults(defineProps<{
  name: string
  email?: string
  avatarUrl?: string
  signOutLabel?: string
  compact?: boolean
  onSignOut?: () => void
  class?: HTMLAttributes["class"]
}>(), { signOutLabel: "Se déconnecter", compact: false })
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger data-slot="user-menu" :aria-label="name"
      :class="cn('flex items-center gap-2 rounded-md p-1 text-left text-sm outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50', props.class)">
      <Avatar class="size-8">
        <AvatarImage v-if="avatarUrl" :src="avatarUrl" alt="" />
        <AvatarFallback>{{ initials(name) }}</AvatarFallback>
      </Avatar>
      <span v-if="!compact" class="grid leading-tight">
        <span class="truncate font-medium">{{ name }}</span>
        <span v-if="email" class="truncate text-xs text-muted-foreground">{{ email }}</span>
      </span>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="min-w-56">
      <DropdownMenuLabel class="grid font-normal">
        <span class="font-medium">{{ name }}</span>
        <span v-if="email" class="text-xs text-muted-foreground">{{ email }}</span>
      </DropdownMenuLabel>
      <template v-if="$slots.default">
        <DropdownMenuSeparator />
        <slot />
      </template>
      <template v-if="onSignOut">
        <DropdownMenuSeparator />
        <DropdownMenuItem @select="onSignOut()"><LogOutIcon />{{ signOutLabel }}</DropdownMenuItem>
      </template>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
