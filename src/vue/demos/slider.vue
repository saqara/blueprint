<script setup lang="ts">
import { Slider } from "@/registry/vue/ui/slider"
</script>

<template>
  <div class="max-w-sm space-y-2 text-sm">
    <p>Note qualité minimale</p>
    <Slider :default-value="[8, 16]" :min="0" :max="20" :step="1" />
  </div>
</template>
