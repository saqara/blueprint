<script setup lang="ts">
import { Button } from "@/registry/vue/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/registry/vue/ui/tooltip"
</script>

<template>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger as-child><Button variant="outline">Score RSE</Button></TooltipTrigger>
      <TooltipContent>Moyenne des 3 derniers questionnaires</TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>
