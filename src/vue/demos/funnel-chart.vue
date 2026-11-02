<script setup lang="ts">
import { FunnelChart } from "@/registry/vue/ui/funnel-chart"

const stages = [
  { label: "Envoyées", value: 240 },
  { label: "Ouvertes", value: 186 },
  { label: "Commencées", value: 121 },
  { label: "Complétées", value: 78 },
  { label: "Validées", value: 64 },
]
</script>

<template>
  <FunnelChart class="w-full max-w-2xl" label="Demandes RSE du trimestre, de l’envoi à la validation" :stages="stages" />
</template>
