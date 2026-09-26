<script setup lang="ts">
import { Progress } from "@/registry/vue/ui/progress"

const scores = [
  { label: "Note qualité", value: 82, variant: "success" as const },
  { label: "Note RSE", value: 55, variant: "warning" as const },
  { label: "Documents à jour", value: 20, variant: "destructive" as const },
]
</script>

<template>
  <div class="w-full max-w-sm space-y-4 text-sm">
    <div class="space-y-1">
      <p>Import : 1 250 / 3 000 lignes</p>
      <Progress :model-value="42" />
    </div>
    <div v-for="s in scores" :key="s.label" class="space-y-1">
      <p class="flex justify-between"><span>{{ s.label }}</span><span class="text-muted-foreground">{{ s.value }} %</span></p>
      <Progress :model-value="s.value" :variant="s.variant" />
    </div>
  </div>
</template>
