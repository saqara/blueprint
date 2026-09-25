<script setup lang="ts">
import { Badge } from "@/registry/vue/ui/badge"
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
  </div>
</template>
