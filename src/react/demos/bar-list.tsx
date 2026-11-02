import { BarList, type BarListItem } from "@/registry/react/ui/bar-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/registry/react/ui/tabs"

const byRegion: BarListItem[] = [
  { label: "Nouvelle-Aquitaine", value: 48 },
  { label: "Occitanie", value: 31 },
  { label: "Auvergne-Rhône-Alpes", value: 22 },
  { label: "Île-de-France", value: 17 },
  { label: "Pays de la Loire", value: 10 },
]
const byTrade: BarListItem[] = [
  { label: "Gros œuvre", value: 41 },
  { label: "Carrelage", value: 26 },
  { label: "Électricité", value: 24 },
  { label: "Plomberie", value: 21 },
  { label: "Menuiserie", value: 16 },
]

export default function BarListDemo() {
  return (
    <Tabs defaultValue="region" className="w-full max-w-md">
      <TabsList>
        <TabsTrigger value="region">Par région</TabsTrigger>
        <TabsTrigger value="trade">Par activité</TabsTrigger>
      </TabsList>
      <TabsContent value="region"><BarList items={byRegion} valueFormatter={(v) => `${v} évaluations`} /></TabsContent>
      <TabsContent value="trade"><BarList items={byTrade} valueFormatter={(v) => `${v} évaluations`} /></TabsContent>
    </Tabs>
  )
}
