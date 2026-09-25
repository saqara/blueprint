import { useState } from "react"
import { Building2, CircleHelp, ClipboardCheck, Leaf, Users } from "lucide-react"
import { AppShellHeader, type AppNavItem } from "@/registry/react/blocks/app-shell-header"
import { Badge } from "@/registry/react/ui/badge"
import { Button } from "@/registry/react/ui/button"

const nav: AppNavItem[] = [
  { id: "annuaire", label: "Mes entreprises", icon: Building2 },
  { id: "evaluations", label: "Évaluations", icon: ClipboardCheck, badge: 3, badgeLabel: "3 évaluations à réaliser" },
  { id: "rse", label: "Demandes RSE", icon: Leaf, badge: 1 },
  { id: "organisation", label: "Organisation", icon: Users },
]

export default function AppShellHeaderDemo() {
  const [active, setActive] = useState("annuaire")
  return (
    <div className="h-full overflow-auto">
      <AppShellHeader className="min-h-full" nav={nav} activeId={active} onNavigate={setActive}
        user={{ name: "Alexandre Brochot", email: "alexandre.brochot@saqara.com" }} onSignOut={() => {}}
        product={<Badge variant="secondary">Fournisseur</Badge>}
        actions={<Button variant="ghost" size="icon" aria-label="Aide"><CircleHelp /></Button>}>
        <p className="text-sm text-muted-foreground">Contenu de la page « {nav.find((n) => n.id === active)?.label} ».</p>
      </AppShellHeader>
    </div>
  )
}
