<script setup lang="ts">
import { RadialChart } from "@/registry/vue/ui/radial-chart"

const parts = [
  { key: "documents", label: "Documents", value: 8, max: 10 },
  { key: "questions", label: "Questions", value: 34, max: 40 },
  { key: "contacts", label: "Contacts", value: 2, max: 3 },
]
</script>

<template>
  <div class="grid w-full max-w-2xl items-start gap-8 sm:grid-cols-2">
    <RadialChart label="Complétude de la fiche Bâti Sud SAS" :rings="[{ key: 'fiche', label: 'Fiche', value: 72 }]">
      <span class="font-heading text-2xl font-semibold tabular-nums">72 %</span>
      <span class="text-xs text-muted-foreground">Fiche complète</span>
    </RadialChart>
    <RadialChart label="Complétude par partie" :rings="parts" :value-formatter="(v, m) => `${v}/${m}`" />
  </div>
</template>
