<script setup lang="ts">
import { Slider } from "@/registry/vue/ui/slider"

const bands = [{ value: 6, label: "6" }, { value: 13, label: "13" }]
</script>

<template>
  <div class="w-full max-w-sm space-y-2 text-sm">
    <p>Note qualité minimale</p>
    <Slider :default-value="[8, 16]" :min="0" :max="20" :step="1" :thumb-labels="['Note minimale', 'Note maximale']" :marks="bands" />
  </div>
</template>
