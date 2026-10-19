import { createElement as e } from "react"
import { renderToString } from "react-dom/server"
import { createSSRApp, h } from "vue"
import { renderToString as renderVue } from "vue/server-renderer"
import { describe, expect, it } from "vitest"
import * as RAgent from "../registry/react/ui/agent"
import * as RCot from "../registry/react/ui/chain-of-thought"
import * as RCite from "../registry/react/ui/inline-citation"
import * as RPlan from "../registry/react/ui/plan"
import * as RQueue from "../registry/react/ui/queue"
import * as RReasoning from "../registry/react/ui/reasoning"
import * as RSources from "../registry/react/ui/sources"
import * as RTask from "../registry/react/ui/task"
import * as RTool from "../registry/react/ui/tool"
import * as VAgent from "../registry/vue/ui/agent"
import * as VCot from "../registry/vue/ui/chain-of-thought"
import * as VCite from "../registry/vue/ui/inline-citation"
import * as VPlan from "../registry/vue/ui/plan"
import * as VQueue from "../registry/vue/ui/queue"
import * as VReasoning from "../registry/vue/ui/reasoning"
import * as VSources from "../registry/vue/ui/sources"
import * as VTask from "../registry/vue/ui/task"
import * as VTool from "../registry/vue/ui/tool"

// SSR text separators (<!-- -->) dropped, so assertions read like the visible text.
const bare = (html: string) => html.replace(/<!--[^>]*-->/g, "")
const vue = async (render: () => unknown) => bare(await renderVue(createSSRApp({ render: render as never })))
const r = (node: ReturnType<typeof e>) => Promise.resolve(bare(renderToString(node)))

describe.each([
  ["react", (state: string, out: object) => r(e(RTool.Tool, { defaultOpen: true },
    e(RTool.ToolHeader, { type: "tool-run_sql", state } as never),
    e(RTool.ToolContent, null, e(RTool.ToolInput, { input: { q: 1 } }), e(RTool.ToolOutput, out as never))))],
  ["vue", (state: string, out: object) => vue(() => h(VTool.Tool, { defaultOpen: true }, () => [
    h(VTool.ToolHeader, { type: "tool-run_sql", state }),
    h(VTool.ToolContent, null, () => [h(VTool.ToolInput, { input: { q: 1 } }), h(VTool.ToolOutput, out)]),
  ]))],
] as const)("%s tool", (_, render) => {
  it("labels states and sections in French, and names the tool from its type", async () => {
    const html = await render("output-available", { output: { total: 3 }, errorText: undefined })
    expect(html).toContain("run_sql")
    expect(html).toContain("Terminé")
    expect(html).toContain("Paramètres")
    expect(html).toContain("Résultat")
  })
  it("shows an error state and its message", async () => {
    const html = await render("output-error", { output: undefined, errorText: "Table introuvable." })
    expect(html).toContain(">Erreur<")
    expect(html).toContain("Table introuvable.")
  })
})

describe.each([
  ["react", (p: object) => r(e(RReasoning.Reasoning, p, e(RReasoning.ReasoningTrigger), e(RReasoning.ReasoningContent, null, e("p", null, "Je filtre."))))],
  ["vue", (p: object) => vue(() => h(VReasoning.Reasoning, p, () => [h(VReasoning.ReasoningTrigger), h(VReasoning.ReasoningContent, null, () => h("p", null, "Je filtre."))]))],
] as const)("%s reasoning", (_, render) => {
  it("is open while streaming, with the app's HTML styled as a message", async () => {
    const html = await render({ isStreaming: true })
    expect(html).toContain("Réflexion…")
    expect(html).toContain('data-state="open"')
    expect(html).toMatch(/data-slot="message-response"[^>]*><p>Je filtre\.<\/p>/)
  })
  it("states how long it thought once done", async () => {
    expect(await render({ duration: 4, defaultOpen: false })).toContain("Réflexion de 4 s")
  })
})

describe.each([
  ["react", () => r(e("div", null,
    e(RCot.ChainOfThought, null, e(RCot.ChainOfThoughtHeader)),
    e(RTask.Task, null, e(RTask.TaskTrigger, { title: "Recherche des fournisseurs" })),
    e(RPlan.Plan, null, e(RPlan.PlanTrigger)),
    e(RSources.Sources, null, e(RSources.SourcesTrigger, { count: 2 }), e(RSources.SourcesContent, { forceMount: true }, e(RSources.Source, { href: "https://insee.fr", title: "Insee" }))),
    e(RAgent.AgentTools, { type: "single", collapsible: true }, e(RAgent.AgentTool, { tool: { inputSchema: {} }, value: "a" })),
    e(RQueue.QueueSectionLabel, { count: 3, label: "tâches" }),
  ))],
  ["vue", () => vue(() => h("div", null, [
    h(VCot.ChainOfThought, null, () => h(VCot.ChainOfThoughtHeader)),
    h(VTask.Task, null, () => h(VTask.TaskTrigger, { title: "Recherche des fournisseurs" })),
    h(VPlan.Plan, null, () => h(VPlan.PlanTrigger)),
    h(VSources.Sources, null, () => [h(VSources.SourcesTrigger, { count: 2 }), h(VSources.Source, { href: "https://insee.fr", title: "Insee" })]),
    h(VAgent.AgentTools, { type: "single", collapsible: true }, () => h(VAgent.AgentTool, { tool: { inputSchema: {} }, value: "a" })),
    h(VQueue.QueueSectionLabel, { count: 3, label: "tâches" }),
  ]))],
] as const)("%s collapsible pieces", (_, render) => {
  it("speak French and name their controls", async () => {
    const html = await render()
    expect(html).toContain("Raisonnement")
    expect(html).toMatch(/<button[^>]*><svg[\s\S]*?Recherche des fournisseurs/)
    expect(html).toContain("Afficher ou masquer le plan")
    expect(html).toContain("2 sources utilisées")
    expect(html).toContain("(nouvel onglet)")
    expect(html).toContain("Outils")
    expect(html).toContain("Sans description")
    expect(html).toMatch(/3 tâches/)
  })
})

describe.each([
  ["react", () => r(e(RCite.InlineCitationCard, null,
    e(RCite.InlineCitationCardTrigger, { sources: ["https://www.insee.fr/a", "https://data.gouv.fr/b"] }),
  ))],
  ["vue", () => vue(() => h(VCite.InlineCitationCard, null, () => h(VCite.InlineCitationCardTrigger, { sources: ["https://www.insee.fr/a", "https://data.gouv.fr/b"] })))],
] as const)("%s inline-citation", (_, render) => {
  it("shows the first host and the count, and can be focused", async () => {
    const html = await render()
    expect(html).toMatch(/www\.insee\.fr\s*\+1/)
    expect(html).toContain('tabindex="0"')
  })
  it("names the carousel arrows", async () => {
    const nav = await (_ === "react"
      ? r(e(RCite.InlineCitationCarousel, null, e(RCite.InlineCitationCarouselPrev), e(RCite.InlineCitationCarouselNext)))
      : vue(() => h(VCite.InlineCitationCarousel, null, () => [h(VCite.InlineCitationCarouselPrev), h(VCite.InlineCitationCarouselNext)])))
    expect(nav).toContain('aria-label="Source précédente"')
    expect(nav).toContain('aria-label="Source suivante"')
  })
})
