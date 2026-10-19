import { createElement as e } from "react"
import { renderToString } from "react-dom/server"
import { createSSRApp, h } from "vue"
import { renderToString as renderVue } from "vue/server-renderer"
import { describe, expect, it } from "vitest"
import { Dashboard as RDashboard } from "../registry/react/blocks/dashboard"
import VDashboard from "../registry/vue/blocks/Dashboard.vue"

const base = {
  periods: [{ value: "6m", label: "6 derniers mois" }, { value: "7j", label: "7 derniers jours" }],
  period: "6m",
  stats: [{ label: "Fournisseurs actifs", value: "1 284" }, { label: "Évaluations", value: "912" }],
  panels: [{ id: "notes", title: "Note qualité", summary: "La note monte de 14 à 17." }],
  activity: [{ id: "1", title: "Acme SAS a rejoint le réseau", time: "hier", dateTime: "2026-10-18" }],
}

describe.each([
  ["react", (p: Record<string, unknown>) => renderToString(e(RDashboard, { ...base, panels: base.panels.map((x) => ({ ...x, content: e("svg", { "data-chart": "" }) })), ...p }))],
  ["vue", (p: Record<string, unknown>) => renderVue(createSSRApp({ render: () => h(VDashboard, { ...base, ...p }, { "panel-notes": () => h("svg", { "data-chart": "" }) }) }))],
] as const)("%s dashboard block", (_, render) => {
  it("lays out the KPIs, a titled chart with its text alternative, and the activity", async () => {
    const html = await render({})
    expect(html).toMatch(/<h1[^>]*>Tableau de bord<\/h1>/)
    expect(html).toContain("1 284")
    const titleId = html.match(/<h2[^>]*\bid="([^"]+)"[^>]*>Note qualité<\/h2>/)?.[1]
    expect(titleId).toBeTruthy()
    expect(html).toMatch(new RegExp(`<figure aria-labelledby="${titleId}"[^>]*>(<!--[^>]*-->)*<svg data-chart(="")?></svg>(<!--[^>]*-->)*<figcaption class="sr-only">La note monte de 14 à 17\\.</figcaption>`))
    expect(html).toMatch(/<h2[^>]*>Activité récente<\/h2>/)
    expect(html).toMatch(/<time datetime="2026-10-18"[^>]*>hier<\/time>/i)
  })
  it("names the period selector and announces the period shown", async () => {
    const html = await render({})
    expect(html).toContain('aria-label="Période"')
    expect(html).toMatch(/<p role="status" class="sr-only">Période affichée : (<!--[^>]*-->)*6 derniers mois/)
  })
  it("shows an empty state when there is no activity", async () => {
    expect(await render({ activity: [] })).toContain("Aucune activité sur la période.")
  })
  it("swaps figures, charts and activity for skeletons while loading", async () => {
    const html = await render({ loading: true })
    expect(html).toContain('aria-busy="true"')
    expect(html).not.toContain("1 284")
    expect(html).not.toContain("data-chart")
    expect(html).not.toContain("Acme SAS")
    expect(html.match(/data-slot="skeleton"/g)?.length).toBe(2 + 1 + 3)
  })
})
