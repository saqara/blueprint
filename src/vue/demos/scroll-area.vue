<script setup lang="ts">
import { ScrollArea } from "@/registry/vue/ui/scroll-area"
import { Separator } from "@/registry/vue/ui/separator"

const lots = Array.from({ length: 30 }, (_, i) => `Lot ${String(i + 1).padStart(2, "0")}`)
</script>

<template>
  <ScrollArea class="h-48 w-56 rounded-md border">
    <div class="p-3 text-sm">
      <div v-for="lot in lots" :key="lot"><div class="py-1.5">{{ lot }}</div><Separator /></div>
    </div>
  </ScrollArea>
</template>
