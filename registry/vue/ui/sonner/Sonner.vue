<!-- Saqara (see tests/sonner.test.ts): stylesheet imported here; typed toasts tinted from Saqara tokens, like Alert. -->
<script lang="ts" setup>
import "vue-sonner/style.css"
import type { ToasterProps } from "vue-sonner"
import { CircleCheckIcon, InfoIcon, Loader2Icon, OctagonXIcon, TriangleAlertIcon, XIcon } from "@lucide/vue"
import { Toaster as Sonner } from "vue-sonner"
import { cn } from "@/lib/utils"

const props = withDefaults(defineProps<ToasterProps>(), {
  richColors: true,
  toastOptions: () => ({ classes: { description: "text-muted-foreground!" } }),
})
</script>

<template>
  <Sonner
    :class="cn('toaster group', props.class)"
    :style="{
      '--normal-bg': 'var(--popover)',
      '--normal-text': 'var(--popover-foreground)',
      '--normal-border': 'var(--border)',
      '--border-radius': 'var(--radius)',
      '--success-bg': 'color-mix(in oklab, var(--success) 10%, var(--popover))',
      '--success-border': 'color-mix(in oklab, var(--success) 50%, var(--popover))',
      '--success-text': 'var(--popover-foreground)',
      '--info-bg': 'color-mix(in oklab, var(--info) 10%, var(--popover))',
      '--info-border': 'color-mix(in oklab, var(--info) 50%, var(--popover))',
      '--info-text': 'var(--popover-foreground)',
      '--warning-bg': 'color-mix(in oklab, var(--warning) 10%, var(--popover))',
      '--warning-border': 'color-mix(in oklab, var(--warning) 50%, var(--popover))',
      '--warning-text': 'var(--popover-foreground)',
      '--error-bg': 'color-mix(in oklab, var(--destructive) 10%, var(--popover))',
      '--error-border': 'color-mix(in oklab, var(--destructive) 50%, var(--popover))',
      '--error-text': 'var(--popover-foreground)',
    }"
    v-bind="props"
  >
    <template #success-icon>
      <CircleCheckIcon class="size-4 text-success" />
    </template>
    <template #info-icon>
      <InfoIcon class="size-4 text-info" />
    </template>
    <template #warning-icon>
      <TriangleAlertIcon class="size-4 text-warning" />
    </template>
    <template #error-icon>
      <OctagonXIcon class="size-4 text-destructive" />
    </template>
    <template #loading-icon>
      <div>
        <Loader2Icon class="size-4 animate-spin" />
      </div>
    </template>
    <template #close-icon>
      <XIcon class="size-4" />
    </template>
  </Sonner>
</template>
