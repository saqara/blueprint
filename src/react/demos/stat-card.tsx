import { ClipboardCheck, Leaf, Users } from "lucide-react"
import { StatCard } from "@/registry/react/ui/stat-card"

export default function StatCardDemo() {
  return (
    <div className="grid max-w-2xl gap-3 sm:grid-cols-3">
      <StatCard label="Évaluations" value="128" description="+12 ce mois-ci" icon={<ClipboardCheck />} />
      <StatCard label="Note RSE moyenne" value="14,2/20" icon={<Leaf />} />
      <StatCard label="Fournisseurs actifs" value="342" icon={<Users />} />
    </div>
  )
}
