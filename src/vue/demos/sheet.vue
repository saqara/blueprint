<script setup lang="ts">
import { Button } from "@/registry/vue/ui/button"
import { CollapsibleSection } from "@/registry/vue/ui/collapsible-section"
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/registry/vue/ui/sheet"

const contacts = ["Camille Martin — Directrice", "Julien Petit — Conducteur de travaux", "Inès Morel — Comptable", "Hugo Laurent — QSE"]
</script>

<template>
  <Sheet>
    <SheetTrigger as-child><Button variant="outline">Voir la fiche</Button></SheetTrigger>
    <SheetContent size="lg">
      <SheetHeader>
        <SheetTitle>Bâti Sud SAS</SheetTitle>
        <SheetDescription>SIREN 900 000 001 — Lyon</SheetDescription>
      </SheetHeader>
      <SheetBody scroll-progress class="grid content-start gap-4">
        <CollapsibleSection title="Contacts">
          <template #actions><Button variant="ghost" size="sm">Ajouter</Button></template>
          <ul class="grid gap-2 text-sm"><li v-for="c in contacts" :key="c">{{ c }}</li></ul>
        </CollapsibleSection>
        <CollapsibleSection title="Historique" :default-open="false">
          <p class="text-sm text-muted-foreground">Aucune évaluation pour l'instant.</p>
        </CollapsibleSection>
        <p v-for="i in 12" :key="i" class="text-sm text-muted-foreground">Note interne {{ i }} : document à jour.</p>
      </SheetBody>
      <SheetFooter><Button>Enregistrer</Button></SheetFooter>
    </SheetContent>
  </Sheet>
</template>
