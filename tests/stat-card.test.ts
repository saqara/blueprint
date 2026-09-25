import { createElement } from "react"
import { renderToString } from "react-dom/server"
import { createSSRApp, h } from "vue"
import { renderToString as renderVue } from "vue/server-renderer"
import { describe, expect, it } from "vitest"
import { StatCard as ReactStatCard } from "../registry/react/ui/stat-card"
import { StatCard as VueStatCard } from "../registry/vue/ui/stat-card"

describe("stat-card", () => {
  it.each([
    ["react", () => Promise.resolve(renderToString(createElement(ReactStatCard, { label: "Évaluations", value: "128", description: "+12 ce mois-ci" })))],
    ["vue", () => renderVue(createSSRApp({ render: () => h(VueStatCard, { label: "Évaluations", value: "128", description: "+12 ce mois-ci" }) }))],
  ])("%s renders label, value and description", async (_, render) => {
    const html = await render()
    expect(html).toContain("Évaluations")
    expect(html).toContain("128")
    expect(html).toContain("+12 ce mois-ci")
    expect(html).toContain('data-slot="stat-card"')
  })
})
