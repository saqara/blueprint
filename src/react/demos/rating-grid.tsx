import { useState } from "react"
import { RatingGrid } from "@/registry/react/ui/rating-grid"

const criteria = [
  { id: "delais", label: "Respect des délais" },
  { id: "qualite", label: "Qualité d'exécution", description: "Finitions, conformité aux plans" },
  { id: "securite", label: "Sécurité du chantier" },
]

export default function RatingGridDemo() {
  const [value, setValue] = useState<Record<string, string>>({ delais: "4" })
  return (
    <div className="w-full max-w-2xl">
      <RatingGrid caption="Évaluation qualité — Bâti Sud SAS" criteria={criteria} value={value} onValueChange={setValue} />
    </div>
  )
}
