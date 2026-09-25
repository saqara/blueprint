<script setup lang="ts">
import type { AppNavItem } from "@/registry/vue/blocks/AppShellSidebar.vue"
import { Building2, ClipboardCheck, Leaf, Users } from "@lucide/vue"
import { ref } from "vue"
import AppShellSidebar from "@/registry/vue/blocks/AppShellSidebar.vue"

const nav: AppNavItem[] = [
  { id: "annuaire", label: "Mes entreprises", icon: Building2 },
  { id: "evaluations", label: "Évaluations", icon: ClipboardCheck, badge: 3 },
  { id: "rse", label: "Demandes RSE", icon: Leaf, badge: 1 },
  { id: "organisation", label: "Organisation", icon: Users },
]
const active = ref("annuaire")
</script>

<template>
  <!-- transform + [&_.h-svh]:h-full keep the fixed, full-height sidebar inside the frame (showcase only) -->
  <div class="h-[600px] overflow-hidden rounded-lg border [transform:translateZ(0)]">
    <AppShellSidebar class="h-full min-h-0 [&_.h-svh]:h-full" :nav="nav" :active-id="active" :user="{ name: 'Camille Martin', email: 'camille.martin@exemple.fr' }"
      @navigate="(id) => (active = id)" @sign-out="() => {}">
      <p class="text-sm text-muted-foreground">Contenu de la page « {{ nav.find((n) => n.id === active)?.label }} ».</p>
    </AppShellSidebar>
  </div>
</template>
