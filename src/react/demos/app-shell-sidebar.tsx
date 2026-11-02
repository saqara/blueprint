import { useState } from "react"
import { Building2, ClipboardCheck, Leaf, Users } from "lucide-react"
import { AppShellSidebar, type AppNavItem } from "@/registry/react/blocks/app-shell-sidebar"

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

export default function AppShellSidebarDemo() {
  const [active, setActive] = useState("annuaire")
  return (
    // [&_.h-svh]:h-full keeps the full-height sidebar inside the docs frame (which provides the transform)
    <div className="h-full overflow-hidden">
      <AppShellSidebar variant="inset" className="h-full min-h-0 [&_.h-svh]:h-full" nav={nav} activeId={active} onNavigate={setActive}
        user={{ name: "Alexandre Brochot", email: "alexandre.brochot@saqara.com" }} onSignOut={() => {}}>
        <h2 className="font-heading text-xl font-semibold">{nav.find((n) => n.id === active)?.label}</h2>
        <ul className="mt-4 divide-y rounded-lg border text-sm">
          {companies.map((c) => (
            <li key={c.name} className="flex items-center justify-between gap-3 px-4 py-3">
              <span className="min-w-0"><span className="block truncate font-medium">{c.name}</span><span className="block truncate text-muted-foreground">{c.detail}</span></span>
              <span className="shrink-0 font-mono text-xs text-muted-foreground">{c.note}</span>
            </li>
          ))}
        </ul>
      </AppShellSidebar>
    </div>
  )
}
