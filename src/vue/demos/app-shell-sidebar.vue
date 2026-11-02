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
const companies = [
  { name: "Durand & Fils", detail: "Lyon · Gros œuvre", note: "17/20" },
  { name: "Bâti Rhône", detail: "Villeurbanne · Charpente", note: "15/20" },
  { name: "Bâti Sud SAS", detail: "Montpellier · Carrelage", note: "16/20" },
]
const active = ref("annuaire")
</script>

<template>
  <!-- [&_.h-svh]:h-full keeps the full-height sidebar inside the docs frame (which provides the transform) -->
  <div class="h-full overflow-hidden">
    <AppShellSidebar variant="inset" class="h-full min-h-0 [&_.h-svh]:h-full" :nav="nav" :active-id="active" :user="{ name: 'Alexandre Brochot', email: 'alexandre.brochot@saqara.com' }"
      @navigate="(id) => (active = id)" @sign-out="() => {}">
      <h2 class="font-heading text-xl font-semibold">{{ nav.find((n) => n.id === active)?.label }}</h2>
      <ul class="mt-4 divide-y rounded-lg border text-sm">
        <li v-for="c in companies" :key="c.name" class="flex items-center justify-between gap-3 px-4 py-3">
          <span class="min-w-0"><span class="block truncate font-medium">{{ c.name }}</span><span class="block truncate text-muted-foreground">{{ c.detail }}</span></span>
          <span class="shrink-0 font-mono text-xs text-muted-foreground">{{ c.note }}</span>
        </li>
      </ul>
    </AppShellSidebar>
  </div>
</template>
