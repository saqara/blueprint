<script setup lang="ts">
import { ref } from "vue"
import { Suggestion, Suggestions } from "@/registry/vue/ui/suggestion"

const suggestions = ["Top 10 des villes", "Fournisseurs inactifs depuis 6 mois", "Évolution des inscriptions en 2026", "Notes moyennes par catégorie"]
const picked = ref<string>()
</script>

<template>
  <div class="w-full max-w-xl space-y-3">
    <Suggestions>
      <Suggestion v-for="s in suggestions" :key="s" :suggestion="s" @click="picked = $event" />
    </Suggestions>
    <p class="text-sm text-muted-foreground">{{ picked ? `Question choisie : ${picked}` : "Choisissez une question." }}</p>
  </div>
</template>
