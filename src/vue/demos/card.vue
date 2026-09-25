<script setup lang="ts">
import { Button } from "@/registry/vue/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/registry/vue/ui/card"
</script>

<template>
  <Card class="max-w-sm">
    <CardHeader>
      <CardTitle>Bâti Sud SAS</CardTitle>
      <CardDescription>SIREN 552 100 554 — Lyon</CardDescription>
    </CardHeader>
    <CardContent class="text-sm">Note qualité : 16/20</CardContent>
    <CardFooter><Button size="sm">Voir la fiche</Button></CardFooter>
  </Card>
</template>
