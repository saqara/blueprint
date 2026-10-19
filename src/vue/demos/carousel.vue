<script setup lang="ts">
import { Card, CardContent } from "@/registry/vue/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/registry/vue/ui/carousel"

const sources = ["Rapport annuel 2025", "Fiche Kbis", "Attestation URSSAF", "Avis clients"]
</script>

<template>
  <Carousel class="mx-12 max-w-xs">
    <CarouselContent>
      <CarouselItem v-for="title in sources" :key="title">
        <Card><CardContent class="flex h-32 items-center justify-center text-center font-medium">{{ title }}</CardContent></Card>
      </CarouselItem>
    </CarouselContent>
    <CarouselPrevious />
    <CarouselNext />
  </Carousel>
</template>
