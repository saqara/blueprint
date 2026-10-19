import { useState } from "react"
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { Dashboard, type DashboardActivity } from "@/registry/react/blocks/dashboard"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/registry/react/ui/chart"

const periods = [
  { value: "7j", label: "7 derniers jours" },
  { value: "6m", label: "6 derniers mois" },
]
const notes = [
  { month: "Avr.", qualite: 14 }, { month: "Mai", qualite: 15 }, { month: "Juin", qualite: 15 },
  { month: "Juil.", qualite: 16 }, { month: "Août", qualite: 16 }, { month: "Sept.", qualite: 17 },
]
const signups = [
  { month: "Avr.", inscriptions: 38 }, { month: "Mai", inscriptions: 52 }, { month: "Juin", inscriptions: 47 },
  { month: "Juil.", inscriptions: 31 }, { month: "Août", inscriptions: 22 }, { month: "Sept.", inscriptions: 64 },
]
const noteConfig = { qualite: { label: "Note qualité", color: "var(--chart-1)" } } satisfies ChartConfig
const signupConfig = { inscriptions: { label: "Inscriptions", color: "var(--chart-2)" } } satisfies ChartConfig
const activity: DashboardActivity[] = [
  { id: "1", title: "Acme SAS a rejoint le réseau", description: "Inscription validée par Camille Martin", time: "il y a 2 h", dateTime: "2026-10-19T08:00" },
  { id: "2", title: "Nouvelle évaluation : Durand & Fils", description: "Note qualité 17/20", time: "hier", dateTime: "2026-10-18" },
  { id: "3", title: "Attestation URSSAF expirée", description: "Bâti Rhône – à renouveler", time: "12 oct.", dateTime: "2026-10-12" },
]

// A fake API: the figures change with the period, after a short load.
export default function DashboardDemo() {
  const [period, setPeriod] = useState("6m")
  const [loading, setLoading] = useState(false)
  const week = period === "7j"
  const change = (p: string) => { setPeriod(p); setLoading(true); setTimeout(() => setLoading(false), 600) }

  return (
    <div className="p-6">
      <Dashboard
        description="Vue d’ensemble de votre réseau de fournisseurs."
        periods={periods} period={period} onPeriodChange={change} loading={loading}
        stats={[
          { label: "Fournisseurs actifs", value: "1 284", description: week ? "+6 cette semaine" : "+48 sur 6 mois" },
          { label: "Évaluations", value: week ? "37" : "912", description: "Note moyenne 15,8/20" },
          { label: "Inscriptions en attente", value: "14", description: "Délai moyen 2 jours" },
          { label: "Documents expirés", value: "9", description: "À relancer" },
        ]}
        panels={[
          {
            id: "notes", title: "Note qualité moyenne", description: "Sur 20, toutes catégories",
            summary: "La note qualité moyenne monte de 14 en avril à 17 en septembre.",
            content: (
              <ChartContainer config={noteConfig} className="h-56 w-full">
                <LineChart data={notes} margin={{ left: 0, right: 12, top: 8 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis domain={[0, 20]} tickLine={false} axisLine={false} width={28} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line dataKey="qualite" type="monotone" stroke="var(--color-qualite)" strokeWidth={2} dot={false} />
                </LineChart>
              </ChartContainer>
            ),
          },
          {
            id: "inscriptions", title: "Inscriptions par mois",
            summary: "Les inscriptions varient de 22 en août à 64 en septembre, le plus haut des six mois.",
            content: (
              <ChartContainer config={signupConfig} className="h-56 w-full">
                <BarChart data={signups} margin={{ left: 0, right: 12, top: 8 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} width={28} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="inscriptions" fill="var(--color-inscriptions)" radius={4} />
                </BarChart>
              </ChartContainer>
            ),
          },
        ]}
        activity={week ? [] : activity}
      />
    </div>
  )
}
