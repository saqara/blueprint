<script setup lang="ts">
import type { AppNavItem } from "@/registry/vue/blocks/AppShellHeader.vue"
import { Building2, ClipboardCheck, Leaf, Users } from "@lucide/vue"
import { ref } from "vue"
import AppShellHeader from "@/registry/vue/blocks/AppShellHeader.vue"

const nav: AppNavItem[] = [
  { id: "annuaire", label: "Mes entreprises", icon: Building2 },
  { id: "evaluations", label: "Évaluations", icon: ClipboardCheck, badge: 3 },
  { id: "rse", label: "Demandes RSE", icon: Leaf, badge: 1 },
  { id: "organisation", label: "Organisation", icon: Users },
]
const active = ref("annuaire")
</script>

<template>
  <div class="h-[600px] overflow-auto rounded-lg border [transform:translateZ(0)]">
    <AppShellHeader class="min-h-full" :nav="nav" :active-id="active" :user="{ name: 'Camille Martin', email: 'camille.martin@exemple.fr' }"
      @navigate="(id) => (active = id)" @sign-out="() => {}">
      <p class="text-sm text-muted-foreground">Contenu de la page « {{ nav.find((n) => n.id === active)?.label }} ».</p>
    </AppShellHeader>
  </div>
</template>
