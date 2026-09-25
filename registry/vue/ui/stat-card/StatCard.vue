<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader } from "@/registry/vue/ui/card"

const props = defineProps<{ label: string; value: string | number; description?: string; class?: HTMLAttributes["class"] }>()
</script>

<template>
  <Card data-slot="stat-card" :class="cn('gap-2 py-4', props.class)">
    <CardHeader class="flex flex-row items-center justify-between gap-2 px-4">
      <CardDescription>{{ label }}</CardDescription>
      <span v-if="$slots.icon" class="text-muted-foreground [&_svg]:size-4"><slot name="icon" /></span>
    </CardHeader>
    <CardContent class="px-4">
      <div class="font-heading text-2xl font-semibold">{{ value }}</div>
      <p v-if="description" class="text-xs text-muted-foreground">{{ description }}</p>
    </CardContent>
  </Card>
</template>
