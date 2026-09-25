<script setup lang="ts">
import { Button } from "@/registry/vue/ui/button"
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <Button>Enregistrer</Button>
    <Button variant="secondary">Annuler</Button>
    <Button variant="outline">Exporter</Button>
    <Button variant="ghost">Plus d'options</Button>
    <Button variant="destructive">Supprimer</Button>
    <Button variant="link">Voir le détail</Button>
    <Button disabled>Désactivé</Button>
    <Button loading>Enregistrement…</Button>
  </div>
</template>
