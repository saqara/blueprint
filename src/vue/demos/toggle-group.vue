<script setup lang="ts">
import { ToggleGroup, ToggleGroupItem } from "@/registry/vue/ui/toggle-group"
</script>

<template>
  <ToggleGroup type="single" default-value="all" variant="outline">
    <ToggleGroupItem value="all">Toutes</ToggleGroupItem>
    <ToggleGroupItem value="qualified">Qualifiées</ToggleGroupItem>
    <ToggleGroupItem value="pending">À compléter</ToggleGroupItem>
  </ToggleGroup>
</template>
