import { Building2, ClipboardCheck, Users } from "lucide-react"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider } from "@/registry/react/ui/sidebar"

const items = [
  { label: "Mes entreprises", icon: Building2, active: true },
  { label: "Évaluations", icon: ClipboardCheck },
  { label: "Organisation", icon: Users },
]

export default function SidebarDemo() {
  return (
    <SidebarProvider className="min-h-0">
      <Sidebar collapsible="none" className="h-64 rounded-md border">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Portail fournisseur</SidebarGroupLabel>
            <SidebarMenu>
              {items.map((it) => (
                <SidebarMenuItem key={it.label}>
                  <SidebarMenuButton isActive={it.active}><it.icon />{it.label}</SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  )
}
