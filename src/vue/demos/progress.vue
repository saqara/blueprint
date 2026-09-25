<script setup lang="ts">
import { Progress } from "@/registry/vue/ui/progress"
</script>

<template>
  <div class="max-w-sm space-y-1 text-sm">
    <p>Import : 1 250 / 3 000 lignes</p>
    <Progress :model-value="42" />
  </div>
</template>
