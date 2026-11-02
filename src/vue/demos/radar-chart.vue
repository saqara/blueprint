<script setup lang="ts">
import { RadarChart } from "@/registry/vue/ui/radar-chart"

const data = [
  { axis: "Environnement", entreprise: 15, secteur: 11 },
  { axis: "Social", entreprise: 13, secteur: 12 },
  { axis: "Éthique", entreprise: 17, secteur: 13 },
  { axis: "Achats responsables", entreprise: 9, secteur: 10 },
  { axis: "Gouvernance", entreprise: 14, secteur: 12 },
]
const series = [{ key: "entreprise", label: "Bâti Sud SAS" }, { key: "secteur", label: "Moyenne du secteur" }]
</script>

<template>
  <RadarChart
    class="w-full max-w-md"
    label="Note RSE de Bâti Sud SAS par pilier, sur 20"
    :data="data"
    :max="20"
    :series="series"
    :value-formatter="(v) => `${v}/20`"
  />
</template>
