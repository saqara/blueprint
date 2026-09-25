import { useState } from "react"
import { Building2, ClipboardCheck, Leaf, Users } from "lucide-react"
import { AppShellHeader, type AppNavItem } from "@/registry/react/blocks/app-shell-header"

const nav: AppNavItem[] = [
  { id: "annuaire", label: "Mes entreprises", icon: Building2 },
  { id: "evaluations", label: "Évaluations", icon: ClipboardCheck, badge: 3 },
  { id: "rse", label: "Demandes RSE", icon: Leaf, badge: 1 },
  { id: "organisation", label: "Organisation", icon: Users },
]

export default function AppShellHeaderDemo() {
  const [active, setActive] = useState("annuaire")
  return (
    <div className="h-full overflow-auto">
      <AppShellHeader className="min-h-full" nav={nav} activeId={active} onNavigate={setActive}
        user={{ name: "Alexandre Brochot", email: "alexandre.brochot@exemple.fr" }} onSignOut={() => {}}>
        <p className="text-sm text-muted-foreground">Contenu de la page « {nav.find((n) => n.id === active)?.label} ».</p>
      </AppShellHeader>
    </div>
  )
}
