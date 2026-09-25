<script setup lang="ts">
import type { AppNavItem } from "@/registry/vue/blocks/AppShellHeader.vue"
import { Building2, CircleHelp, ClipboardCheck, Leaf, Users } from "@lucide/vue"
import { ref } from "vue"
import AppShellHeader from "@/registry/vue/blocks/AppShellHeader.vue"
import { Badge } from "@/registry/vue/ui/badge"
import { Button } from "@/registry/vue/ui/button"

const nav: AppNavItem[] = [
  { id: "annuaire", label: "Mes entreprises", icon: Building2 },
  { id: "evaluations", label: "Évaluations", icon: ClipboardCheck, badge: 3, badgeLabel: "3 évaluations à réaliser" },
  { id: "rse", label: "Demandes RSE", icon: Leaf, badge: 1 },
  { id: "organisation", label: "Organisation", icon: Users },
]
const active = ref("annuaire")
</script>

<template>
  <div class="h-full overflow-auto">
    <AppShellHeader class="min-h-full" :nav="nav" :active-id="active" :user="{ name: 'Alexandre Brochot', email: 'alexandre.brochot@saqara.com' }"
      @navigate="(id) => (active = id)" @sign-out="() => {}">
      <template #product><Badge variant="secondary">Fournisseur</Badge></template>
      <template #actions><Button variant="ghost" size="icon" aria-label="Aide"><CircleHelp /></Button></template>
      <p class="text-sm text-muted-foreground">Contenu de la page « {{ nav.find((n) => n.id === active)?.label }} ».</p>
    </AppShellHeader>
  </div>
</template>
