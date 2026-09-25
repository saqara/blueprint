<script setup lang="ts">
import { SearchX } from "@lucide/vue"
import { Button } from "@/registry/vue/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/registry/vue/ui/empty"
</script>

<template>
  <Empty class="border">
    <EmptyHeader>
      <EmptyMedia variant="icon"><SearchX /></EmptyMedia>
      <EmptyTitle>Aucune entreprise</EmptyTitle>
      <EmptyDescription>Aucun résultat ne correspond à ces filtres.</EmptyDescription>
    </EmptyHeader>
    <EmptyContent><Button variant="outline">Réinitialiser les filtres</Button></EmptyContent>
  </Empty>
</template>
