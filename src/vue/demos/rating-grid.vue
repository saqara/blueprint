<script setup lang="ts">
import { ref } from "vue"
import { RatingGrid } from "@/registry/vue/ui/rating-grid"

const criteria = [
  { id: "delais", label: "Respect des délais" },
  { id: "qualite", label: "Qualité d'exécution", description: "Finitions, conformité aux plans" },
  { id: "securite", label: "Sécurité du chantier" },
]
const value = ref<Record<string, string>>({ delais: "4" })
</script>

<template>
  <div class="w-full max-w-2xl">
    <RatingGrid v-model:value="value" caption="Évaluation qualité — Bâti Sud SAS" :criteria="criteria" />
  </div>
</template>
