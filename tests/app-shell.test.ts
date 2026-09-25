import { createElement as e } from "react"
import { renderToString } from "react-dom/server"
import { createSSRApp, h } from "vue"
import { renderToString as renderVue } from "vue/server-renderer"
import { describe, expect, it } from "vitest"
import { AppShellSidebar as RSidebar, handleNavigate as rHandle } from "../registry/react/blocks/app-shell-sidebar"
import VSidebar, { handleNavigate as vHandle } from "../registry/vue/blocks/AppShellSidebar.vue"
import { AppShellHeader as RHeader } from "../registry/react/blocks/app-shell-header"
import VHeader from "../registry/vue/blocks/AppShellHeader.vue"

export const nav = [
  { id: "annuaire", label: "Mes entreprises" },
  { id: "evaluations", label: "Évaluations", badge: 3 },
  { id: "organisation", label: "Organisation", href: "#organisation" },
]
export const user = { name: "Camille Martin", email: "camille.martin@exemple.fr" }
export const current = (html: string) => (html.match(/aria-current="page"/g) ?? []).length

describe.each([
  ["react", async (p: Record<string, unknown>) => renderToString(e(RSidebar as any, p, "Contenu"))],
  ["vue", async (p: Record<string, unknown>) => renderVue(createSSRApp({ render: () => h(VSidebar as any, p, { default: () => "Contenu" }) }))],
])("%s app-shell-sidebar", (_, render) => {
  it("renders nav, badge, page title, user and content", async () => {
    const html = await render({ nav, activeId: "evaluations", user })
    for (const text of ["Mes entreprises", "Évaluations", "Organisation", "Camille Martin", "Contenu"]) expect(html).toContain(text)
    expect(html).toMatch(/<h1[^>]*>Évaluations<\/h1>/)
    expect(html).toMatch(/>3</)
    expect(current(html)).toBe(1)
    expect(html).toContain('href="#organisation"')
  })
  it("renders badges as identity pills, like the header shell", async () => {
    const html = await render({ nav, activeId: "annuaire" })
    expect(html).toMatch(/data-sidebar="menu-badge"[^>]*class="[^"]*bg-identity|class="[^"]*bg-identity[^"]*"[^>]*data-sidebar="menu-badge"/)
  })
  it("prefers an explicit title and hides the theme toggle without a theme", async () => {
    const html = await render({ nav, activeId: "annuaire", title: "Tableau de bord" })
    expect(html).toMatch(/<h1[^>]*>Tableau de bord<\/h1>/)
    expect(html).not.toContain('data-slot="theme-toggle"')
  })
})

describe.each([
  ["react", async (p: Record<string, unknown>) => renderToString(e(RHeader as any, p, "Contenu"))],
  ["vue", async (p: Record<string, unknown>) => renderVue(createSSRApp({ render: () => h(VHeader as any, p, { default: () => "Contenu" }) }))],
])("%s app-shell-header", (_, render) => {
  it("renders brand, page title, tabs with badge, user menu and content", async () => {
    const html = await render({ nav, activeId: "evaluations", user, theme: "light", onThemeChange: () => {} })
    for (const text of ["Saqara", "Mes entreprises", "Organisation", "Contenu", 'aria-label="Navigation principale"', 'aria-label="Menu"']) expect(html).toContain(text)
    expect(html).toMatch(/>3</)
    expect(current(html)).toBe(1)
    expect(html).toContain('href="#organisation"')
    expect(html).toContain('data-slot="theme-toggle"')
  })
})

describe.each([["react", rHandle], ["vue", vHandle]] as const)("%s sidebar navigation", (_, handle) => {
  const event = () => { const e = { prevented: false, preventDefault() { e.prevented = true } }; return e }
  it("always closes the mobile sheet, and prevents the link only when the app navigates", () => {
    const calls: string[] = []
    const withApp = event()
    handle(withApp, "rse", (id) => calls.push(`nav:${id}`), () => calls.push("close"))
    const plainLink = event()
    handle(plainLink, "rse", undefined, () => calls.push("close"))
    expect(calls).toEqual(["close", "nav:rse", "close"])
    expect([withApp.prevented, plainLink.prevented]).toEqual([true, false])
  })
  it("keeps an accessible name on the logo when collapsed (sr-only, not hidden)", async () => {
    const { readFileSync } = await import("node:fs")
    const src = readFileSync(_ === "react" ? "registry/react/blocks/app-shell-sidebar.tsx" : "registry/vue/blocks/AppShellSidebar.vue", "utf8")
    expect(src).toContain("group-data-[collapsible=icon]:[&>span]:sr-only")
    expect(src).not.toContain("group-data-[collapsible=icon]:[&>span]:hidden")
  })
})

describe.each([
  ["react", async (p: Record<string, unknown>) => renderToString(e(RHeader as any, p, "Contenu"))],
  ["vue", async (p: Record<string, unknown>) => renderVue(createSSRApp({ render: () => h(VHeader as any, p, { default: () => "Contenu" }) }))],
])("%s app-shell-header layout", (_, render) => {
  it("shows a page title only when the app passes one (the active tab names the page)", async () => {
    expect(await render({ nav, activeId: "evaluations" })).not.toMatch(/border-l[^"]*">[\s\S]{0,200}Évaluations/)
    expect(await render({ nav, activeId: "evaluations", title: "Campagne 2026" })).toContain("Campagne 2026")
  })
  it("uses the sidebar palette and keeps entries on one line", async () => {
    const html = await render({ nav, activeId: "evaluations", user })
    const header = html.match(/<header[^>]*class="([^"]*)"/)![1]
    expect(header).toContain("bg-sidebar")
    expect(header).toContain("border-sidebar-border")
    const nav_ = html.match(/<nav aria-label="Navigation principale" class="([^"]*)"/)![1]
    expect(nav_).toContain("min-w-0")
    const active = html.match(/<(?:a|button)[^>]*aria-current="page"[^>]*class="([^"]*)"|<(?:a|button)[^>]*class="([^"]*)"[^>]*aria-current="page"/)!
    const cls = active[1] ?? active[2]
    expect(cls).toContain("whitespace-nowrap")
    // The active tab keeps its red tint on hover (tests/sidebar-gaps.test.ts); other tabs hover in neutral grey.
    expect(cls).toContain("hover:bg-primary/10")
    expect(html).toMatch(/<(?:a|button)(?![^>]*aria-current)[^>]*class="[^"]*hover:bg-sidebar-accent/)
  })
})

describe.each([
  ["react sidebar", async (p: Record<string, unknown>) => renderToString(e(RSidebar as any, p, "Contenu"))],
  ["vue sidebar", async (p: Record<string, unknown>) => renderVue(createSSRApp({ render: () => h(VSidebar as any, p, { default: () => "Contenu" }) }))],
  ["react header", async (p: Record<string, unknown>) => renderToString(e(RHeader as any, p, "Contenu"))],
  ["vue header", async (p: Record<string, unknown>) => renderVue(createSSRApp({ render: () => h(VHeader as any, p, { default: () => "Contenu" }) }))],
])("%s page title", (_, render) => {
  it("renders an explicit title as an h1", async () => {
    expect(await render({ nav, activeId: "annuaire", title: "Campagne 2026" })).toMatch(/<h1[^>]*>(<!--[^>]*-->)?[\s\S]{0,120}Campagne 2026/)
  })
  it("never renders an empty h1", async () => {
    expect(await render({ nav })).not.toMatch(/<h1[^>]*>\s*(<!--[^>]*-->\s*)*<\/h1>/)
  })
})

const vueSlots = (p: Record<string, unknown>) => ({
  default: () => "Contenu",
  ...(p.actions ? { actions: () => h("a", { href: "https://aos.exemple.fr" }, "Aller vers AOS") } : {}),
  ...(p.product ? { product: () => h("span", "Hub") } : {}),
})
describe.each([
  ["react", async (p: Record<string, unknown>) => renderToString(e(RHeader as any, {
    ...p,
    actions: p.actions ? e("a", { href: "https://aos.exemple.fr" }, "Aller vers AOS") : undefined,
    product: p.product ? e("span", null, "Hub") : undefined,
  }, "Contenu"))],
  ["vue", async (p: Record<string, unknown>) => renderVue(createSSRApp({ render: () => h(VHeader as any, p, vueSlots(p)) }))],
])("%s app-shell-header slots", (_, render) => {
  it("renders header actions and a product next to the logo", async () => {
    const html = await render({ nav, actions: true, product: true })
    expect(html).toContain("Aller vers AOS")
    expect(html).toMatch(/Saqara[\s\S]{0,400}Hub/)
  })
})

describe.each([
  ["react sidebar", async (p: Record<string, unknown>) => renderToString(e(RSidebar as any, p, "Contenu"))],
  ["vue sidebar", async (p: Record<string, unknown>) => renderVue(createSSRApp({ render: () => h(VSidebar as any, p, { default: () => "Contenu" }) }))],
  ["react header", async (p: Record<string, unknown>) => renderToString(e(RHeader as any, p, "Contenu"))],
  ["vue header", async (p: Record<string, unknown>) => renderVue(createSSRApp({ render: () => h(VHeader as any, p, { default: () => "Contenu" }) }))],
])("%s nav badge", (_, render) => {
  it("gives the count a screen-reader context, and hides the bare number", async () => {
    const html = await render({ nav })
    expect(html).toMatch(/<span class="sr-only">\s*(<!--[^>]*-->)?3 en attente(<!--[^>]*-->)?<\/span>/)
    // Inside the same link / button as the label, so it is part of its accessible name.
    expect(html).toMatch(/Évaluations(?:(?!<\/(?:a|button)>)[\s\S])*3 en attente/)
    expect(html).toMatch(/aria-hidden="true"[^>]*>(<!--[^>]*-->)?3(<!--[^>]*-->)?</)
  })
  it("takes a badgeLabel", async () => {
    const html = await render({ nav: [{ id: "notes", label: "Notes", badge: 2, badgeLabel: "2 notes à réaliser" }] })
    expect(html).toContain("2 notes à réaliser")
  })
})

describe.each([
  ["react", async (p: Record<string, unknown>) => renderToString(e(RSidebar as any, p, "Contenu"))],
  ["vue", async (p: Record<string, unknown>) => renderVue(createSSRApp({ render: () => h(VSidebar as any, p, { default: () => "Contenu" }) }))],
])("%s app-shell-sidebar inset", (_, render) => {
  it("frames the content as a panel on the sidebar colour with variant=inset (shadcn dashboard layout)", async () => {
    const html = await render({ nav, variant: "inset" })
    expect(html).toContain('data-variant="inset"')
    expect(html).toContain("has-data-[variant=inset]:bg-sidebar")
  })
  it("keeps the classic sidebar by default", async () => {
    expect(await render({ nav })).toContain('data-variant="sidebar"')
  })
})

describe.each([
  ["react", async (p: Record<string, unknown>) => renderToString(e(RSidebar as any, p, "Contenu"))],
  ["vue", async (p: Record<string, unknown>) => renderVue(createSSRApp({ render: () => h(VSidebar as any, p, { default: () => "Contenu" }) }))],
])("%s app-shell-sidebar rail", (_, render) => {
  it("has no rail: its resize cursor suggested a resizable sidebar (the header trigger toggles it)", async () => {
    const html = await render({ nav, variant: "inset" })
    expect(html).not.toContain('data-sidebar="rail"')
    expect(html).toContain('data-sidebar="trigger"')
  })
})
