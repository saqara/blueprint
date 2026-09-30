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

export type AppNavItem = { id: string; label: string; icon?: React.ComponentType<{ className?: string }>; badge?: number; badgeLabel?: string; badgeVariant?: NavBadgeVariant; href?: string }
/** A count is information, not an alert: identity (brand red) by default, info or secondary for neutral counts. */
export type NavBadgeVariant = "identity" | "info" | "secondary"
export type AppUser = { name: string; email?: string; avatarUrl?: string }

// Nav entries: neutral sidebar-accent on hover, red tint when active (as the sidebar); they never wrap.
const entryBase = "inline-flex h-8 shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-3 text-sm font-medium outline-none transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 [&_svg]:size-4 [&_svg]:shrink-0"

type AppShellHeaderProps = {
  nav: AppNavItem[]
  activeId?: string
  onNavigate?: (id: string) => void
  title?: React.ReactNode
  logo?: React.ReactNode
  /** Next to the logo: product name, role badge… */
  product?: React.ReactNode
  /** Before the theme toggle and user menu: external link, icon buttons… */
  actions?: React.ReactNode
  user?: AppUser
  onSignOut?: () => void
  signOutLabel?: string
  userMenuItems?: React.ReactNode
  theme?: "light" | "dark"
  onThemeChange?: (theme: "light" | "dark") => void
  menuLabel?: string
  /** Default variant of the nav badges (an item's badgeVariant wins). */
  badgeVariant?: NavBadgeVariant
  /** id of <main>, target of the built-in skip link. */
  mainId?: string
  skipLinkLabel?: string
  className?: string
  children?: React.ReactNode
}

// Saqara block: top-bar shell (pfou-hub structure). Routing-agnostic — `href` renders links, `onNavigate` handles clicks.
function AppShellHeader({
  nav, activeId, onNavigate, title, logo, product, actions, user, onSignOut, signOutLabel, userMenuItems, theme, onThemeChange, menuLabel = "Menu", badgeVariant = "identity", mainId = "contenu", skipLinkLabel = "Aller au contenu", className, children,
}: AppShellHeaderProps) {
  const [open, setOpen] = React.useState(false)
  const active = nav.find((item) => item.id === activeId)
  const PageIcon = active?.icon
  const brand = (
    <span className="flex items-center gap-2">
      {logo ?? <SaqaraLogo withText />}
      {product}
    </span>
  )

  const entry = (item: AppNavItem, mobile: boolean) => {
    const isActive = item.id === activeId
    const Icon = item.icon
    const props = {
      "aria-current": isActive ? ("page" as const) : undefined,
      className: cn(entryBase, isActive && "bg-primary/10 text-identity-text hover:bg-primary/10 hover:text-identity-text", mobile && "w-full justify-start"),
      onClick: (event: React.MouseEvent) => {
        setOpen(false)
        if (onNavigate) { event.preventDefault(); onNavigate(item.id) }
      },
    }
    const content = (
      <>
        {Icon && <Icon />}
        {item.label}
        {!!item.badge && (
          <>
            <Badge variant={item.badgeVariant ?? badgeVariant} aria-hidden="true" className="ml-1 h-5 min-w-5 px-1">{item.badge}</Badge>
            <span className="sr-only">{item.badgeLabel ?? `${item.badge} en attente`}</span>
          </>
        )}
      </>
    )
    return item.href
      ? <a key={item.id} href={item.href} {...props}>{content}</a>
      : <button key={item.id} type="button" {...props}>{content}</button>
  }

  return (
    <div data-slot="app-shell-header" className={cn("flex min-h-svh flex-col bg-background", className)}>
      {/* Skip link: moves focus to <main> without touching the URL (works with hash routers too). */}
      <a href={`#${mainId}`} className="sr-only rounded-md bg-background px-3 py-2 text-sm font-medium shadow-md outline-none focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus-visible:ring-[3px] focus-visible:ring-ring/50"
        onClick={(event) => { event.preventDefault(); document.getElementById(mainId)?.focus() }}>
        {skipLinkLabel}
      </a>
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
            {actions}
            {theme && onThemeChange && <ThemeToggle theme={theme} onThemeChange={onThemeChange} />}
            {user && <UserMenu {...user} onSignOut={onSignOut} signOutLabel={signOutLabel} compact>{userMenuItems}</UserMenu>}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" aria-label={menuLabel}><MenuIcon /></Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                {/* A logo link inside the sheet navigates too: close it like a nav entry. */}
                <SheetHeader onClick={(event) => (event.target as HTMLElement).closest("a") && setOpen(false)}>
                  <SheetTitle>{brand}</SheetTitle>
                </SheetHeader>
                <nav aria-label="Navigation principale" className="grid gap-1 px-4">
                  {nav.map((item) => entry(item, true))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <main id={mainId} tabIndex={-1} className="flex-1 p-4 outline-none sm:p-6">{children}</main>
    </div>
  )
}

export { AppShellHeader }
