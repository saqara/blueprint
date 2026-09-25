import { createElement as e } from "react"
import { renderToString } from "react-dom/server"
import { createSSRApp, h } from "vue"
import { renderToString as renderVue } from "vue/server-renderer"
import { describe, expect, it } from "vitest"
import * as R from "../registry/react/ui/alert"
import * as V from "../registry/vue/ui/alert"

describe.each([["react", R.alertVariants], ["vue", V.alertVariants]] as const)("%s alert grid", (_, variants) => {
  it("adds a third column when an action is present (with or without icon)", () => {
    const base = variants({})
    expect(base).toContain("has-data-[slot=alert-action]:grid-cols-[0_1fr_auto]")
    expect(base).toContain("has-[>svg]:has-data-[slot=alert-action]:grid-cols-[calc(var(--spacing)*4)_1fr_auto]")
  })
})

describe("alert close", () => {
  it.each([
    ["react", async (p: Record<string, unknown>) => renderToString(e(R.Alert, null, e(R.AlertTitle, null, "Import terminé"), e(R.AlertClose, p)))],
    ["vue", async (p: Record<string, unknown>) => renderVue(createSSRApp({ render: () => h(V.Alert, null, () => [h(V.AlertTitle, null, () => "Import terminé"), h(V.AlertClose, p)]) }))],
  ])("%s renders a labelled close button in the action slot", async (_, render) => {
    const html = await render({})
    expect(html).toContain('data-slot="alert-action"')
    expect(html).toMatch(/<button[^>]*aria-label="Fermer"/)
    expect(await render({ label: "Masquer" })).toContain('aria-label="Masquer"')
  })
})

describe("alert title", () => {
  it.each([
    ["react", async () => renderToString(e(R.Alert, null, e(R.AlertTitle, null, "Un titre d'alerte assez long pour tenir sur deux lignes")))],
    ["vue", async () => renderVue(createSSRApp({ render: () => h(V.Alert, null, () => h(V.AlertTitle, null, () => "Un titre d'alerte assez long pour tenir sur deux lignes")) }))],
  ])("%s wraps long titles instead of truncating them", async (_, render) => {
    const title = (await render()).match(/data-slot="alert-title"[^>]*class="([^"]*)"|class="([^"]*)"[^>]*data-slot="alert-title"/)!
    expect(title[1] ?? title[2]).not.toContain("line-clamp")
  })
})
