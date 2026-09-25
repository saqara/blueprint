<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { MoonIcon, SunIcon } from "@lucide/vue"
import { Button } from "@/registry/vue/ui/button"

// Saqara: presentational only — the app keeps its own theme state/storage (v-model:theme).
const props = withDefaults(defineProps<{ label?: string; class?: HTMLAttributes["class"] }>(), { label: "Basculer le thème" })
const theme = defineModel<"light" | "dark">("theme", { default: "light" })
</script>

<template>
  <Button variant="ghost" size="icon" data-slot="theme-toggle" :aria-label="label" :aria-pressed="theme === 'dark'" :class="props.class"
    @click="theme = theme === 'dark' ? 'light' : 'dark'">
    <SunIcon v-if="theme === 'dark'" />
    <MoonIcon v-else />
  </Button>
</template>
