<script setup lang="ts">
import { Button } from "@/registry/vue/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/registry/vue/ui/sheet"
</script>

<template>
  <Sheet>
    <SheetTrigger as-child><Button variant="outline">Voir la fiche</Button></SheetTrigger>
    <SheetContent>
      <SheetHeader>
        <SheetTitle>Bâti Sud SAS</SheetTitle>
        <SheetDescription>SIREN 900 000 001 — Lyon</SheetDescription>
      </SheetHeader>
    </SheetContent>
  </Sheet>
</template>
