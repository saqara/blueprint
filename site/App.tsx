import { useEffect, useRef } from "react"
import { Code2 } from "lucide-react"
import { Button } from "@/registry/react/ui/button"
import { Separator } from "@/registry/react/ui/separator"
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInset,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger,
} from "@/registry/react/ui/sidebar"
import { Toaster } from "@/registry/react/ui/sonner"
import { ToggleGroup, ToggleGroupItem } from "@/registry/react/ui/toggle-group"
import { BLOCKS, CATEGORIES, EXAMPLES, itemInfo, pageTitle, START_PAGES } from "./catalog"
import { ReactIcon, VueIcon } from "./components/FrameworkIcon"
import { ThemeMenu } from "./components/ThemeMenu"
import { useFramework, useRoute, useTheme } from "./hooks"
import type { Fw } from "./lib/framework"
import { toHash, type Route } from "./lib/route"
import { Page } from "./pages/Page"

type NavGroup = { label: string; items: { label: string; route: Route }[] }

const NAV: NavGroup[] = [
  { label: "Démarrer", items: START_PAGES.map((p) => ({ label: p.title, route: { section: "demarrer", slug: p.slug } })) },
  ...CATEGORIES.map((c) => ({ label: c.label, items: c.items.map((name) => ({ label: itemInfo(name)?.title ?? name, route: { section: "composants" as const, slug: name } })) })),
  { label: "Blocs", items: BLOCKS.map((name) => ({ label: itemInfo(name)?.title ?? name, route: { section: "blocs" as const, slug: name } })) },
  { label: "Exemples", items: EXAMPLES.map((e) => ({ label: e.title, route: { section: "exemples" as const, slug: e.slug } })) },
]

export function App() {
  const route = useRoute()
  const [fw, setFw] = useFramework()
  const theme = useTheme()
  const current = toHash(route)
  // From md up the white panel is the scroll container (inset layout); below, the window scrolls.
  const panel = useRef<HTMLElement>(null)
  useEffect(() => { window.scrollTo(0, 0); panel.current?.scrollTo(0, 0) }, [current])

  return (
    <SidebarProvider>
      {/* Same layout as the app-shell-sidebar block with variant="inset" (shadcn dashboard). */}
      <Sidebar variant="inset">
        <SidebarHeader>
          {/* Same header geometry as the app-shell-sidebar block. */}
          <a href="#/" className="flex h-8 items-center gap-2 px-1 font-heading font-semibold">
            <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="" className="size-6 rounded-md" />
            Blueprint
          </a>
        </SidebarHeader>
        <SidebarContent>
          {NAV.map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const href = toHash(item.route)
                    return (
                      <SidebarMenuItem key={href}>
                        <SidebarMenuButton asChild isActive={href === current}>
                          <a href={href} aria-current={href === current ? "page" : undefined}>{item.label}</a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
      </Sidebar>
      <SidebarInset ref={panel} className="md:h-[calc(100svh-1rem)] md:overflow-y-auto">
        {/* Same top bar as the app-shell-sidebar block: trigger, separator, page title, then controls. */}
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <h1 className="truncate text-sm font-medium">{pageTitle(route)}</h1>
          <div className="ml-auto flex items-center gap-2">
            <ToggleGroup type="single" variant="outline" size="sm" value={fw} onValueChange={(v) => v && setFw(v as Fw)} aria-label="Framework">
              <ToggleGroupItem value="react"><ReactIcon />React</ToggleGroupItem>
              <ToggleGroupItem value="vue"><VueIcon />Vue</ToggleGroupItem>
            </ToggleGroup>
            <ThemeMenu value={theme.choice} onChange={theme.setChoice} />
            <Button variant="ghost" size="icon" asChild>
              <a href="https://github.com/saqara/blueprint" target="_blank" rel="noreferrer" aria-label="Code source sur GitHub"><Code2 /></a>
            </Button>
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 p-6 lg:p-10"><Page route={route} fw={fw} /></main>
      </SidebarInset>
      <Toaster theme={theme.resolved} />
    </SidebarProvider>
  )
}
