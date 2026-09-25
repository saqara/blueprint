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
    // [&_.h-svh]:h-full keeps the full-height sidebar inside the docs frame (which provides the transform)
    <div className="h-full overflow-hidden">
      <AppShellSidebar className="h-full min-h-0 [&_.h-svh]:h-full" nav={nav} activeId={active} onNavigate={setActive}
        user={{ name: "Alexandre Brochot", email: "alexandre.brochot@exemple.fr" }} onSignOut={() => {}}>
        <p className="text-sm text-muted-foreground">Contenu de la page « {nav.find((n) => n.id === active)?.label} ».</p>
      </AppShellSidebar>
    </div>
  )
}
