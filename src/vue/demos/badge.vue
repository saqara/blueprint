<script setup lang="ts">
import { ref } from "vue"
import { Badge } from "@/registry/vue/ui/badge"

const cities = ref(["Lyon", "Lille", "Paris"])
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <Badge>Défaut</Badge>
    <Badge variant="secondary">Brouillon</Badge>
    <Badge variant="outline">Admin</Badge>
    <Badge variant="success">Qualifié</Badge>
    <Badge variant="warning">À compléter</Badge>
    <Badge variant="info">En cours</Badge>
    <Badge variant="identity">Saqara</Badge>
    <Badge variant="destructive">Refusé</Badge>
    <Badge v-for="c in cities" :key="c" variant="secondary" :remove-label="`Retirer ${c}`" :on-remove="() => (cities = cities.filter((x) => x !== c))">{{ c }}</Badge>
  </div>
</template>
