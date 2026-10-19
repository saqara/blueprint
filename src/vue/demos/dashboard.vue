<script setup lang="ts">
import type { DashboardActivity } from "@/registry/vue/blocks/Dashboard.vue"
import type { ChartConfig } from "@/registry/vue/ui/chart"
import { VisAxis, VisGroupedBar, VisLine, VisXYContainer } from "@unovis/vue"
import { computed, ref } from "vue"
import Dashboard from "@/registry/vue/blocks/Dashboard.vue"
import { ChartContainer, ChartCrosshair, ChartTooltip, ChartTooltipContent, componentToString } from "@/registry/vue/ui/chart"

type Note = { month: string; qualite: number }
type Signup = { month: string; inscriptions: number }
const periods = [
  { value: "7j", label: "7 derniers jours" },
  { value: "6m", label: "6 derniers mois" },
]
const notes: Note[] = [
  { month: "Avr.", qualite: 14 }, { month: "Mai", qualite: 15 }, { month: "Juin", qualite: 15 },
  { month: "Juil.", qualite: 16 }, { month: "Août", qualite: 16 }, { month: "Sept.", qualite: 17 },
]
const signups: Signup[] = [
  { month: "Avr.", inscriptions: 38 }, { month: "Mai", inscriptions: 52 }, { month: "Juin", inscriptions: 47 },
  { month: "Juil.", inscriptions: 31 }, { month: "Août", inscriptions: 22 }, { month: "Sept.", inscriptions: 64 },
]
const noteConfig = { qualite: { label: "Note qualité", color: "var(--chart-1)" } } satisfies ChartConfig
const signupConfig = { inscriptions: { label: "Inscriptions", color: "var(--chart-2)" } } satisfies ChartConfig
const x = (_: unknown, i: number) => i
const activity: DashboardActivity[] = [
  { id: "1", title: "Acme SAS a rejoint le réseau", description: "Inscription validée par Camille Martin", time: "il y a 2 h", dateTime: "2026-10-19T08:00" },
  { id: "2", title: "Nouvelle évaluation : Durand & Fils", description: "Note qualité 17/20", time: "hier", dateTime: "2026-10-18" },
  { id: "3", title: "Attestation URSSAF expirée", description: "Bâti Rhône – à renouveler", time: "12 oct.", dateTime: "2026-10-12" },
]

// A fake API: the figures change with the period, after a short load.
const period = ref("6m")
const loading = ref(false)
const week = computed(() => period.value === "7j")
function change(p: string) {
  period.value = p
  loading.value = true
  setTimeout(() => (loading.value = false), 600)
}
const stats = computed(() => [
  { label: "Fournisseurs actifs", value: "1 284", description: week.value ? "+6 cette semaine" : "+48 sur 6 mois" },
  { label: "Évaluations", value: week.value ? "37" : "912", description: "Note moyenne 15,8/20" },
  { label: "Inscriptions en attente", value: "14", description: "Délai moyen 2 jours" },
  { label: "Documents expirés", value: "9", description: "À relancer" },
])
const panels = [
  { id: "notes", title: "Note qualité moyenne", description: "Sur 20, toutes catégories", summary: "La note qualité moyenne monte de 14 en avril à 17 en septembre." },
  { id: "inscriptions", title: "Inscriptions par mois", summary: "Les inscriptions varient de 22 en août à 64 en septembre, le plus haut des six mois." },
]
</script>

<template>
  <div class="p-6">
    <Dashboard
      description="Vue d’ensemble de votre réseau de fournisseurs."
      :periods="periods" :period="period" :on-period-change="change" :loading="loading"
      :stats="stats" :panels="panels" :activity="week ? [] : activity"
    >
      <template #panel-notes>
        <ChartContainer :config="noteConfig" class="h-56 w-full" cursor>
          <VisXYContainer :data="notes" :y-domain="[0, 20]" :margin="{ left: 0, right: 12, top: 8 }">
            <VisLine :x="x" :y="(d: Note) => d.qualite" :color="noteConfig.qualite.color" />
            <VisAxis type="x" :x="x" :num-ticks="notes.length" :tick-format="(i: number) => notes[i]?.month" :tick-line="false" :domain-line="false" :grid-line="false" />
            <VisAxis type="y" :num-ticks="4" :tick-line="false" :domain-line="false" />
            <ChartTooltip />
            <ChartCrosshair :template="componentToString(noteConfig, ChartTooltipContent, { labelKey: 'month' })" :color="[noteConfig.qualite.color]" />
          </VisXYContainer>
        </ChartContainer>
      </template>
      <template #panel-inscriptions>
        <ChartContainer :config="signupConfig" class="h-56 w-full">
          <VisXYContainer :data="signups" :margin="{ left: 0, right: 12, top: 8 }">
            <VisGroupedBar :x="x" :y="(d: Signup) => d.inscriptions" :color="signupConfig.inscriptions.color" :rounded-corners="4" />
            <VisAxis type="x" :x="x" :num-ticks="signups.length" :tick-format="(i: number) => signups[i]?.month" :tick-line="false" :domain-line="false" :grid-line="false" />
            <VisAxis type="y" :num-ticks="4" :tick-line="false" :domain-line="false" />
          </VisXYContainer>
        </ChartContainer>
      </template>
    </Dashboard>
  </div>
</template>
