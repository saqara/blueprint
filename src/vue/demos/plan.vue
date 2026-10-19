<script setup lang="ts">
import { Button } from "@/registry/vue/ui/button"
import { Plan, PlanAction, PlanContent, PlanDescription, PlanFooter, PlanHeader, PlanTitle, PlanTrigger } from "@/registry/vue/ui/plan"
</script>

<template>
  <Plan default-open class="max-w-xl">
    <PlanHeader>
      <div>
        <PlanTitle>Analyse des délais de livraison</PlanTitle>
        <PlanDescription>Trois requêtes, puis une synthèse.</PlanDescription>
      </div>
      <PlanAction><PlanTrigger /></PlanAction>
    </PlanHeader>
    <PlanContent>
      <ol class="list-decimal space-y-1 pl-5 text-sm">
        <li>Lister les commandes livrées en retard en 2026</li>
        <li>Regrouper par fournisseur</li>
        <li>Croiser avec les notes moyennes</li>
      </ol>
    </PlanContent>
    <PlanFooter class="justify-end">
      <Button size="sm">Lancer le plan</Button>
    </PlanFooter>
  </Plan>
</template>
