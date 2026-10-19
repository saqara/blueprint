import { createElement as e } from "react"
import { renderToString } from "react-dom/server"
import { createSSRApp, h } from "vue"
import { renderToString as renderVue } from "vue/server-renderer"
import { describe, expect, it } from "vitest"
import * as RA from "../registry/react/ui/attachments"
import * as VA from "../registry/vue/ui/attachments"
import { PromptInput as VPromptInput } from "../registry/vue/ui/prompt-input"

const vue = (render: () => unknown) => renderVue(createSSRApp({ render: render as never }))
const csv = { id: "1", type: "file" as const, mediaType: "text/csv", url: "#" }

describe.each([
  ["react", () => renderToString(e(RA.Attachments, { variant: "inline" }, e(RA.Attachment, { data: csv, onRemove: () => {} }, e(RA.AttachmentInfo), e(RA.AttachmentRemove))))],
  ["vue", () => vue(() => h(VA.Attachments, { variant: "inline" }, () => h(VA.Attachment, { data: csv, onRemove: () => {} }, () => [h(VA.AttachmentInfo), h(VA.AttachmentRemove)])))],
] as const)("%s attachments", (_, render) => {
  it("names an unnamed file and its remove button in French", async () => {
    const html = await render()
    expect(html).toContain("Pièce jointe")
    expect(html).toContain('aria-label="Retirer Pièce jointe"')
    expect(html).toContain("focus-visible:opacity-100")
  })
})

describe.each([
  ["react", () => renderToString(e(RA.Attachments, null, e(RA.AttachmentEmpty)))],
  ["vue", () => vue(() => h(VA.Attachments, null, () => h(VA.AttachmentEmpty)))],
] as const)("%s attachments empty", (_, render) => {
  it("speaks French", async () => expect(await render()).toContain("Aucune pièce jointe"))
})

describe("vue prompt-input", () => {
  it("hands its attached files to the default slot", async () => {
    const html = await vue(() => h(VPromptInput, null, { default: ({ files }: { files: unknown[] }) => h("output", null, `${files.length} fichier`) }))
    expect(html).toContain("<output>0 fichier</output>")
  })
})
