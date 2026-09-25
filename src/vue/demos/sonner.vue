<script setup lang="ts">
import { toast } from "vue-sonner"
import { Button } from "@/registry/vue/ui/button"
import { Toaster } from "@/registry/vue/ui/sonner"
</script>

<template>
  <div class="flex gap-2">
    <Toaster />
    <Button variant="outline" @click="toast.success('Import terminé', { description: '3 000 entreprises mises à jour.' })">Succès</Button>
    <Button variant="outline" @click="toast.error('Échec de l\'import')">Erreur</Button>
  </div>
</template>
