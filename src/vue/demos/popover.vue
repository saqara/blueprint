<script setup lang="ts">
import { Button } from "@/registry/vue/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/registry/vue/ui/popover"
</script>

<template>
  <Popover>
    <PopoverTrigger as-child><Button variant="outline">Détail du score</Button></PopoverTrigger>
    <PopoverContent class="text-sm">Qualité 16/20 · RSE 14/20 · Délais 18/20</PopoverContent>
  </Popover>
</template>
