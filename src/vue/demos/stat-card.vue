<script setup lang="ts">
import { ClipboardCheck, Leaf, Users } from "@lucide/vue"
import { StatCard } from "@/registry/vue/ui/stat-card"
</script>

<template>
  <div class="grid max-w-2xl gap-3 sm:grid-cols-3">
    <StatCard label="Évaluations" value="128" description="+12 ce mois-ci"><template #icon><ClipboardCheck /></template></StatCard>
    <StatCard label="Note RSE moyenne" value="14,2/20"><template #icon><Leaf /></template></StatCard>
    <StatCard label="Fournisseurs actifs" value="342"><template #icon><Users /></template></StatCard>
  </div>
</template>
