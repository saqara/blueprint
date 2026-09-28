<script setup lang="ts">
import { Button } from "@/registry/vue/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/registry/vue/ui/tooltip"
</script>

<template>
  <TooltipProvider>
    <div class="flex flex-wrap gap-2">
      <Tooltip>
        <TooltipTrigger as-child><Button variant="outline">Score RSE</Button></TooltipTrigger>
        <TooltipContent>Moyenne des 3 derniers questionnaires</TooltipContent>
      </Tooltip>
      <!-- A disabled trigger works too: it is wrapped in a focusable span. -->
      <Tooltip>
        <TooltipTrigger as-child><Button disabled>Relancer</Button></TooltipTrigger>
        <TooltipContent>Relance impossible : déjà relancée aujourd'hui</TooltipContent>
      </Tooltip>
    </div>
  </TooltipProvider>
</template>
