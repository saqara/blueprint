<script setup lang="ts">
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/registry/vue/ui/tabs"
</script>

<template>
  <Tabs default-value="todo" class="max-w-md">
    <TabsList>
      <TabsTrigger value="todo">À traiter</TabsTrigger>
      <TabsTrigger value="done">Traitées</TabsTrigger>
    </TabsList>
    <TabsContent value="todo" class="text-sm">3 demandes RSE en attente.</TabsContent>
    <TabsContent value="done" class="text-sm">12 demandes traitées ce mois-ci.</TabsContent>
  </Tabs>
</template>
