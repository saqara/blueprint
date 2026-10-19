<script setup lang="ts">
import { Source, Sources, SourcesContent, SourcesTrigger } from "@/registry/vue/ui/sources"

const sources = [
  { href: "https://www.insee.fr/fr/statistiques", title: "Insee — statistiques des entreprises" },
  { href: "https://annuaire-entreprises.data.gouv.fr", title: "Annuaire des entreprises" },
]
</script>

<template>
  <Sources class="w-full max-w-xl">
    <SourcesTrigger :count="sources.length" />
    <SourcesContent>
      <Source v-for="s in sources" :key="s.href" :href="s.href" :title="s.title" />
    </SourcesContent>
  </Sources>
</template>
