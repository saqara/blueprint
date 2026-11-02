<script setup lang="ts">
import { BarList, type BarListItem } from "@/registry/vue/ui/bar-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/registry/vue/ui/tabs"

const byRegion: BarListItem[] = [
  { label: "Nouvelle-Aquitaine", value: 48 },
  { label: "Occitanie", value: 31 },
  { label: "Auvergne-Rhône-Alpes", value: 22 },
  { label: "Île-de-France", value: 17 },
  { label: "Pays de la Loire", value: 10 },
]
const byTrade: BarListItem[] = [
  { label: "Gros œuvre", value: 41 },
  { label: "Carrelage", value: 26 },
  { label: "Électricité", value: 24 },
  { label: "Plomberie", value: 21 },
  { label: "Menuiserie", value: 16 },
]
const format = (v: number) => `${v} évaluations`
</script>

<template>
  <Tabs default-value="region" class="w-full max-w-md">
    <TabsList>
      <TabsTrigger value="region">Par région</TabsTrigger>
      <TabsTrigger value="trade">Par activité</TabsTrigger>
    </TabsList>
    <TabsContent value="region"><BarList :items="byRegion" :value-formatter="format" /></TabsContent>
    <TabsContent value="trade"><BarList :items="byTrade" :value-formatter="format" /></TabsContent>
  </Tabs>
</template>
