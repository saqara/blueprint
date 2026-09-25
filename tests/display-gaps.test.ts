import { createElement as e } from "react"
import { renderToString } from "react-dom/server"
import { createSSRApp, h } from "vue"
import { renderToString as renderVue } from "vue/server-renderer"
import { describe, expect, it } from "vitest"
import * as RC from "../registry/react/ui/card"
import * as VC from "../registry/vue/ui/card"
import * as RE from "../registry/react/ui/empty"
import * as VE from "../registry/vue/ui/empty"
import * as RT from "../registry/react/ui/tooltip"
import * as VT from "../registry/vue/ui/tooltip"
import { Slider as RSlider } from "../registry/react/ui/slider"
import { Slider as VSlider } from "../registry/vue/ui/slider"
import { FileDropzone as RDrop } from "../registry/react/ui/file-dropzone"
import { FileDropzone as VDrop } from "../registry/vue/ui/file-dropzone"

const vue = (node: () => ReturnType<typeof h>) => renderVue(createSSRApp({ render: node }))
const file = new File(["x"], "fournisseurs.xlsx")

describe("titles take a heading level", () => {
  it("react card and empty: asChild", () => {
    expect(renderToString(e(RC.CardTitle, { asChild: true }, e("h2", null, "Contacts")))).toMatch(/^<h2[^>]*data-slot="card-title"[^>]*>Contacts<\/h2>$/)
    expect(renderToString(e(RE.EmptyTitle, { asChild: true }, e("h3", null, "Aucun contact")))).toMatch(/^<h3[^>]*data-slot="empty-title"[^>]*>Aucun contact<\/h3>$/)
  })
  it("vue card and empty: as", async () => {
    expect(await vue(() => h(VC.CardTitle, { as: "h2" }, () => "Contacts"))).toMatch(/^<h2[^>]*data-slot="card-title"[^>]*>(<!--[^>]*-->)*Contacts(<!--[^>]*-->)*<\/h2>$/)
    expect(await vue(() => h(VE.EmptyTitle, { as: "h3" }, () => "Aucun contact"))).toMatch(/^<h3[^>]*data-slot="empty-title"[^>]*>(<!--[^>]*-->)*Aucun contact(<!--[^>]*-->)*<\/h3>$/)
  })
})

describe("tooltip without a provider", () => {
  it("react renders instead of throwing", () => {
    expect(() => renderToString(e(RT.Tooltip, null, e(RT.TooltipTrigger, null, "Aide"), e(RT.TooltipContent, null, "Texte")))).not.toThrow()
  })
  it("vue renders instead of throwing", async () => {
    await expect(vue(() => h(VT.Tooltip, () => [h(VT.TooltipTrigger, () => "Aide"), h(VT.TooltipContent, () => "Texte")]))).resolves.toContain("Aide")
  })
})

describe("slider thumbLabels", () => {
  const labels = ["Effectif minimum", "Effectif maximum"]
  it("react names each thumb", () => {
    const html = renderToString(e(RSlider, { defaultValue: [10, 50], thumbLabels: labels }))
    for (const l of labels) expect(html).toContain(`aria-label="${l}"`)
  })
  it("vue names each thumb", async () => {
    const html = await vue(() => h(VSlider, { defaultValue: [10, 50], thumbLabels: labels }))
    for (const l of labels) expect(html).toContain(`aria-label="${l}"`)
  })
})

describe("file-dropzone", () => {
  it("react: disabled also locks remove, and inputProps reach the input", () => {
    const html = renderToString(e(RDrop, { files: [file], onFilesChange: () => {}, disabled: true, inputProps: { id: "import", name: "fichier", "data-testid": "import-input" } }))
    expect(html).toMatch(/<button[^>]*aria-label="Retirer fournisseurs.xlsx"[^>]*disabled=""|<button[^>]*disabled=""[^>]*aria-label="Retirer fournisseurs.xlsx"/)
    expect(html).toMatch(/<input(?=[^>]*type="file")(?=[^>]*data-testid="import-input")(?=[^>]*id="import")(?=[^>]*name="fichier")/)
  })
  it("vue: disabled also locks remove, and inputProps reach the input", async () => {
    const html = await vue(() => h(VDrop, { files: [file], disabled: true, inputProps: { id: "import", name: "fichier", "data-testid": "import-input" } }))
    expect(html).toMatch(/<button[^>]*aria-label="Retirer fournisseurs.xlsx"[^>]*disabled|<button[^>]*disabled[^>]*aria-label="Retirer fournisseurs.xlsx"/)
    expect(html).toMatch(/<input(?=[^>]*type="file")(?=[^>]*data-testid="import-input")(?=[^>]*id="import")(?=[^>]*name="fichier")/)
  })
})
