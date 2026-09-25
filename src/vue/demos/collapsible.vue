<script setup lang="ts">
import { ChevronsUpDown } from "@lucide/vue"
import { Button } from "@/registry/vue/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/registry/vue/ui/collapsible"
</script>

<template>
  <Collapsible class="max-w-sm space-y-2">
    <div class="flex items-center justify-between">
      <p class="text-sm font-medium">3 agences rattachées</p>
      <CollapsibleTrigger as-child><Button variant="ghost" size="icon" aria-label="Afficher les agences"><ChevronsUpDown /></Button></CollapsibleTrigger>
    </div>
    <div class="rounded-md border px-3 py-2 text-sm">Lyon Sud</div>
    <CollapsibleContent class="space-y-2">
      <div class="rounded-md border px-3 py-2 text-sm">Villeurbanne</div>
      <div class="rounded-md border px-3 py-2 text-sm">Vienne</div>
    </CollapsibleContent>
  </Collapsible>
</template>
