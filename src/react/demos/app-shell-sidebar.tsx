import { useState } from "react"
import { Building2, ClipboardCheck, Leaf, Users } from "lucide-react"
import { AppShellSidebar, type AppNavItem } from "@/registry/react/blocks/app-shell-sidebar"

const nav: AppNavItem[] = [
  { id: "annuaire", label: "Mes entreprises", icon: Building2 },
  { id: "evaluations", label: "Évaluations", icon: ClipboardCheck, badge: 3 },
  { id: "rse", label: "Demandes RSE", icon: Leaf, badge: 1 },
  { id: "organisation", label: "Organisation", icon: Users },
]

export default function AppShellSidebarDemo() {
  const [active, setActive] = useState("annuaire")
  return (
    // transform keeps the fixed sidebar inside the frame (showcase only)
    <div className="h-[600px] overflow-hidden rounded-lg border [transform:translateZ(0)]">
      <AppShellSidebar className="h-full min-h-0" nav={nav} activeId={active} onNavigate={setActive}
        user={{ name: "Camille Martin", email: "camille.martin@exemple.fr" }} onSignOut={() => {}}>
        <p className="text-sm text-muted-foreground">Contenu de la page « {nav.find((n) => n.id === active)?.label} ».</p>
      </AppShellSidebar>
    </div>
  )
}
