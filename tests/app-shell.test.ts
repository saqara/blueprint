import { createElement as e } from "react"
import { renderToString } from "react-dom/server"
import { createSSRApp, h } from "vue"
import { renderToString as renderVue } from "vue/server-renderer"
import { describe, expect, it } from "vitest"
import { AppShellSidebar as RSidebar } from "../registry/react/blocks/app-shell-sidebar"
import VSidebar from "../registry/vue/blocks/AppShellSidebar.vue"

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
  it("prefers an explicit title and hides the theme toggle without a theme", async () => {
    const html = await render({ nav, activeId: "annuaire", title: "Tableau de bord" })
    expect(html).toMatch(/<h1[^>]*>Tableau de bord<\/h1>/)
    expect(html).not.toContain('data-slot="theme-toggle"')
  })
})
