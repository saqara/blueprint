<script setup lang="ts">
import { ref } from "vue"
import { MultiSelect } from "@/registry/vue/ui/multi-select"

const departments = [
  ["01", "Ain"], ["13", "Bouches-du-Rhône"], ["33", "Gironde"], ["38", "Isère"], ["42", "Loire"],
  ["59", "Nord"], ["69", "Rhône"], ["75", "Paris"],
].map(([value, name]) => ({ value, label: `${value} — ${name}` }))
const value = ref(["69", "38"])
</script>

<template>
  <MultiSelect v-model="value" class="max-w-sm" :options="departments" placeholder="Départements" />
</template>
