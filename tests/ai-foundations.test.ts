import { createElement as e } from "react"
import { renderToString } from "react-dom/server"
import { createSSRApp, h } from "vue"
import { renderToString as renderVue } from "vue/server-renderer"
import { describe, expect, it } from "vitest"
import { CodeBlock as RCodeBlock, CodeBlockCopyButton as RCopy } from "../registry/react/ui/code-block"
import { Shimmer as RShimmer } from "../registry/react/ui/shimmer"
import { CodeBlock as VCodeBlock, CodeBlockCopyButton as VCopy } from "../registry/vue/ui/code-block"
import { Shimmer as VShimmer } from "../registry/vue/ui/shimmer"

const vue = (c: any, props: Record<string, unknown>, slot?: () => unknown) => renderVue(createSSRApp({ render: () => h(c, props, slot as never) }))

describe.each([
  ["react", () => renderToString(e(RShimmer, { as: "span", children: "Réflexion…" }))],
  ["vue", () => vue(VShimmer, { as: "span" }, () => "Réflexion…")],
] as const)("%s shimmer", (_, render) => {
  it("renders the text on the chosen element, with a spread sized to it", async () => {
    const html = await render()
    expect(html).toMatch(/^<span[^>]*data-slot="shimmer"[^>]*>(<!--[^>]*-->)*Réflexion…/)
    expect(html).toContain("--spread:20px")
  })
})

describe.each([
  ["react", () => renderToString(e(RCodeBlock, { code: "SELECT 1;", language: "sql" }, e(RCopy)))],
  ["vue", () => vue(VCodeBlock, { code: "SELECT 1;", language: "sql" }, () => h(VCopy))],
] as const)("%s code-block", (_, render) => {
  it("shows the code before highlighting, a French copy button and a keyboard-reachable scroll area", async () => {
    const html = await render()
    expect(html).toContain("SELECT 1;")
    expect(html).toContain('aria-label="Copier le code"')
    expect(html).toMatch(/<div[^>]*overflow-auto[^>]*tabindex="0"|<div[^>]*tabindex="0"[^>]*overflow-auto/)
  })
})
