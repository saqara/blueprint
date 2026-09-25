"use client"

import * as React from "react"
import { Separator } from "@/registry/react/ui/separator"
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarInset, SidebarMenu,
  SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarRail, SidebarTrigger,
} from "@/registry/react/ui/sidebar"
import { SaqaraLogo } from "@/registry/react/ui/saqara-logo"
import { ThemeToggle } from "@/registry/react/ui/theme-toggle"
import { UserMenu } from "@/registry/react/ui/user-menu"

export type AppNavItem = { id: string; label: string; icon?: React.ComponentType<{ className?: string }>; badge?: number; href?: string }
export type AppUser = { name: string; email?: string; avatarUrl?: string }

type AppShellSidebarProps = {
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
  defaultOpen?: boolean
  className?: string
  children?: React.ReactNode
}

// Saqara block: collapsible sidebar shell. Routing-agnostic — `href` renders links, `onNavigate` handles clicks.
function AppShellSidebar({
  nav, activeId, onNavigate, title, logo, user, onSignOut, userMenuItems, theme, onThemeChange, defaultOpen = true, className, children,
}: AppShellSidebarProps) {
  const active = nav.find((item) => item.id === activeId)
  const PageIcon = active?.icon

  return (
    <SidebarProvider defaultOpen={defaultOpen} className={className}>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex h-8 items-center px-1 group-data-[collapsible=icon]:justify-center">
            {logo ?? <SaqaraLogo withText className="group-data-[collapsible=icon]:[&>span]:hidden" />}
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {nav.map((item) => {
                  const isActive = item.id === activeId
                  const Icon = item.icon
                  const content = (<>{Icon && <Icon />}<span>{item.label}</span></>)
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={item.label}
                        aria-current={isActive ? "page" : undefined}
                        asChild={!!item.href}
                        onClick={(event) => { if (onNavigate) { event.preventDefault(); onNavigate(item.id) } }}
                      >
                        {item.href ? <a href={item.href}>{content}</a> : content}
                      </SidebarMenuButton>
                      {!!item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        {user && (
          <SidebarFooter>
            <UserMenu {...user} onSignOut={onSignOut} className="w-full group-data-[collapsible=icon]:[&>span:last-child]:hidden">
              {userMenuItems}
            </UserMenu>
          </SidebarFooter>
        )}
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          {PageIcon && <PageIcon className="size-4 text-primary" />}
          <h1 className="text-sm font-medium">{title ?? active?.label}</h1>
          {theme && onThemeChange && <ThemeToggle theme={theme} onThemeChange={onThemeChange} className="ml-auto" />}
        </header>
        <div className="flex-1 p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export { AppShellSidebar }
