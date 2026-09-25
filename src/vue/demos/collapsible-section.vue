<script setup lang="ts">
import { CopyIcon } from "@lucide/vue"
import { Button } from "@/registry/vue/ui/button"
import { CollapsibleSection } from "@/registry/vue/ui/collapsible-section"
</script>

<template>
  <div class="grid w-full max-w-md gap-4">
    <CollapsibleSection title="Contacts (2)">
      <template #actions><Button variant="outline" size="sm">Ajouter un contact</Button></template>
      <ul class="grid gap-1 text-sm"><li>Camille Martin — Directrice</li><li>Julien Petit — Conducteur de travaux</li></ul>
    </CollapsibleSection>
    <CollapsibleSection title="Coordonnées bancaires" :default-open="false">
      <template #actions><Button variant="ghost" size="icon-sm" aria-label="Copier l'IBAN"><CopyIcon /></Button></template>
      <p class="font-mono text-sm">FR76 0000 0000 0000 0000 0000 000</p>
    </CollapsibleSection>
  </div>
</template>
