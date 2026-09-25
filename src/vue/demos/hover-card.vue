<script setup lang="ts">
import { Badge } from "@/registry/vue/ui/badge"
import { Button } from "@/registry/vue/ui/button"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/registry/vue/ui/hover-card"
</script>

<template>
  <HoverCard>
    <HoverCardTrigger as-child><Button variant="link">Bâti Sud SAS</Button></HoverCardTrigger>
    <HoverCardContent class="space-y-1 text-sm">
      <p class="font-medium">Bâti Sud SAS</p>
      <p class="text-muted-foreground">SIREN 900 000 001 — Lyon</p>
      <Badge variant="success">Qualifié · 16/20</Badge>
    </HoverCardContent>
  </HoverCard>
</template>
