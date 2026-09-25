<script setup lang="ts">
import { CircleAlert, CircleCheck, Info, TriangleAlert } from "@lucide/vue"
import { ref } from "vue"
import { Alert, AlertAction, AlertClose, AlertDescription, AlertTitle } from "@/registry/vue/ui/alert"
import { Button } from "@/registry/vue/ui/button"

const showWarning = ref(true)
</script>

<template>
  <div class="grid max-w-lg gap-3">
    <Alert variant="info"><Info /><AlertTitle>Import en cours</AlertTitle><AlertDescription>1 250 lignes sur 3 000.</AlertDescription></Alert>
    <Alert variant="success"><CircleCheck /><AlertTitle>Import terminé</AlertTitle><AlertDescription>3 000 entreprises mises à jour.</AlertDescription></Alert>
    <Alert v-if="showWarning" variant="warning"><TriangleAlert /><AlertTitle>Données incomplètes</AlertTitle><AlertDescription>12 SIRET sans adresse.</AlertDescription><AlertClose @click="showWarning = false" /></Alert>
    <Alert variant="destructive"><CircleAlert /><AlertTitle>Échec de l'import</AlertTitle><AlertDescription>Colonne « SIREN » introuvable.</AlertDescription><AlertAction><Button size="sm" variant="outline">Réessayer</Button></AlertAction></Alert>
  </div>
</template>
