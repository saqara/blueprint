"use client"

import * as React from "react"
import { MenuIcon } from "lucide-react"
import { cn } from "cn"
import { Badge } from "@/registry/react/ui/badge"
import { Button } from "@/registry/react/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/registry/react/ui/sheet"
import { SaqaraLogo } from "@/registry/react/ui/saqara-logo"
import { ThemeToggle } from "@/registry/react/ui/theme-toggle"
import { UserMenu } from "@/registry/react/ui/user-menu"

export type AppNavItem = { id: string; label: string; icon?: React.ComponentType<{ className?: string }>; badge?: number; href?: string }
export type AppUser = { name: string; email?: string; avatarUrl?: string }

// Nav entries share the sidebar palette (hover / active = sidebar-accent) and never wrap.
const entryBase = "inline-flex h-8 shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-3 text-sm font-medium outline-none transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 [&_svg]:size-4 [&_svg]:shrink-0"

type AppShellHeaderProps = {
  nav: AppNavItem[]
  activeId?: string
  onNavigate?: (id: string) => void
  title?: React.ReactNode
  logo?: React.ReactNode
  user?: AppUser
  onSignOut?: () => void
  userMenuItems?: React.ReactNode
  theme?: "light" | "dark"
  onThemeChange?: (theme: "light" | "dark") => void
  menuLabel?: string
  className?: string
  children?: React.ReactNode
}

// Saqara block: top-bar shell (pfou-hub structure). Routing-agnostic — `href` renders links, `onNavigate` handles clicks.
function AppShellHeader({
  nav, activeId, onNavigate, title, logo, user, onSignOut, userMenuItems, theme, onThemeChange, menuLabel = "Menu", className, children,
}: AppShellHeaderProps) {
  const [open, setOpen] = React.useState(false)
  const active = nav.find((item) => item.id === activeId)
  const PageIcon = active?.icon
  const brand = logo ?? <SaqaraLogo withText />

  const entry = (item: AppNavItem, mobile: boolean) => {
    const isActive = item.id === activeId
    const Icon = item.icon
    const props = {
      "aria-current": isActive ? ("page" as const) : undefined,
      className: cn(entryBase, isActive && "bg-sidebar-accent text-sidebar-accent-foreground", mobile && "w-full justify-start"),
      onClick: (event: React.MouseEvent) => {
        setOpen(false)
        if (onNavigate) { event.preventDefault(); onNavigate(item.id) }
      },
    }
    const content = (
      <>
        {Icon && <Icon />}
        {item.label}
        {!!item.badge && <Badge variant="identity" className="ml-1 h-5 min-w-5 px-1">{item.badge}</Badge>}
      </>
    )
    return item.href
      ? <a key={item.id} href={item.href} {...props}>{content}</a>
      : <button key={item.id} type="button" {...props}>{content}</button>
  }

  return (
    <div data-slot="app-shell-header" className={cn("flex min-h-svh flex-col bg-background", className)}>
      <header className="sticky top-0 z-40 border-b border-sidebar-border bg-sidebar text-sidebar-foreground">
        <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
          <div className="shrink-0">{brand}</div>
          {/* The active tab already names the page: the title only shows when the app passes one. */}
          {title && (
            // Same rule as the sidebar shell: the page title is an h1 (kept for screen readers on small screens).
            <h1 className="flex shrink-0 items-center gap-2 whitespace-nowrap border-l border-sidebar-border pl-4 text-sm font-medium max-lg:sr-only">
              {PageIcon && <PageIcon className="size-4 text-primary" />}
              {title}
            </h1>
          )}
          <nav aria-label="Navigation principale" className="ml-auto hidden min-w-0 items-center gap-1 overflow-x-auto md:flex">
            {nav.map((item) => entry(item, false))}
          </nav>
          <div className="ml-auto flex shrink-0 items-center gap-1 md:ml-0">
            {theme && onThemeChange && <ThemeToggle theme={theme} onThemeChange={onThemeChange} />}
            {user && <UserMenu {...user} onSignOut={onSignOut} compact>{userMenuItems}</UserMenu>}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" aria-label={menuLabel}><MenuIcon /></Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <SheetHeader><SheetTitle>{brand}</SheetTitle></SheetHeader>
                <nav aria-label="Navigation principale" className="grid gap-1 px-4">
                  {nav.map((item) => entry(item, true))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <main className="flex-1 p-4 sm:p-6">{children}</main>
    </div>
  )
}

export { AppShellHeader }
