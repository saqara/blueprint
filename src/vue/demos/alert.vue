<script setup lang="ts">
import { CircleAlert, CircleCheck, Info, TriangleAlert } from "@lucide/vue"
import { Alert, AlertDescription, AlertTitle } from "@/registry/vue/ui/alert"
</script>

<template>
  <div class="grid max-w-lg gap-3">
    <Alert variant="info"><Info /><AlertTitle>Import en cours</AlertTitle><AlertDescription>1 250 lignes sur 3 000.</AlertDescription></Alert>
    <Alert variant="success"><CircleCheck /><AlertTitle>Import terminé</AlertTitle><AlertDescription>3 000 entreprises mises à jour.</AlertDescription></Alert>
    <Alert variant="warning"><TriangleAlert /><AlertTitle>Données incomplètes</AlertTitle><AlertDescription>12 SIRET sans adresse.</AlertDescription></Alert>
    <Alert variant="destructive"><CircleAlert /><AlertTitle>Échec de l'import</AlertTitle><AlertDescription>Colonne « SIREN » introuvable.</AlertDescription></Alert>
  </div>
</template>
