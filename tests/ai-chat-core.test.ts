import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { createElement as e } from "react"
import { renderToString } from "react-dom/server"
import { createSSRApp, h } from "vue"
import { renderToString as renderVue } from "vue/server-renderer"
import { describe, expect, it } from "vitest"
import { ConversationEmptyState as REmpty, messagesToMarkdown } from "../registry/react/ui/conversation"
import { Message as RMessage, MessageContent as RContent, MessageResponse as RResponse } from "../registry/react/ui/message"
import * as RPrompt from "../registry/react/ui/prompt-input"
import { ConversationEmptyState as VEmpty } from "../registry/vue/ui/conversation"
import { Message as VMessage, MessageContent as VContent, MessageResponse as VResponse } from "../registry/vue/ui/message"
import * as VPrompt from "../registry/vue/ui/prompt-input"

const vue = (render: () => unknown) => renderVue(createSSRApp({ render: render as never }))

function files(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? files(join(dir, d.name)) : [join(dir, d.name)]))
}

describe("AI chat without the AI SDK", () => {
  it("no registry file imports `ai` or a markdown engine", () => {
    const offenders = [...files("registry/react"), ...files("registry/vue")].filter((f) =>
      /from ["'](ai|streamdown|vue-stream-markdown)["']|@streamdown\/|@stream-markdown\//.test(readFileSync(f, "utf8")),
    )
    expect(offenders).toEqual([])
  })
})

describe.each([
  ["react", () => renderToString(e(RMessage, { from: "assistant" }, e(RContent, null, e(RResponse, null, e("p", null, "Bonjour")))))],
  ["vue", () => vue(() => h(VMessage, { from: "assistant" }, () => h(VContent, null, () => h(VResponse, null, () => h("p", null, "Bonjour")))))],
] as const)("%s message", (_, render) => {
  it("styles the app's HTML inside a message-response slot", async () => {
    const html = await render()
    expect(html).toContain("is-assistant")
    expect(html).toMatch(/data-slot="message-response"[^>]*>(<!--[^>]*-->)*<p>Bonjour<\/p>/)
  })
})

describe.each([
  ["react", () => renderToString(e(REmpty))],
  ["vue", () => vue(() => h(VEmpty))],
] as const)("%s conversation empty state", (_, render) => {
  it("speaks French", async () => {
    expect(await render()).toContain("Aucun message")
  })
})

describe("react conversation export", () => {
  it("labels roles in French", () => {
    expect(messagesToMarkdown([{ role: "user", parts: [{ type: "text", text: "Salut" }] }, { role: "assistant", parts: [{ type: "text", text: "Bonjour" }] }]))
      .toBe("**Utilisateur:** Salut\n\n**Assistant:** Bonjour")
  })
})

const reactPrompt = (status?: RPrompt.ChatStatus) =>
  renderToString(e(RPrompt.PromptInput, { onSubmit: () => {} },
    e(RPrompt.PromptInputBody, null, e(RPrompt.PromptInputTextarea)),
    e(RPrompt.PromptInputFooter, null,
      e(RPrompt.PromptInputTools, null, e(RPrompt.PromptInputActionMenu, null, e(RPrompt.PromptInputActionMenuTrigger))),
      e(RPrompt.PromptInputSubmit, { status, onStop: () => {} }))))
const vuePrompt = (status?: string) =>
  vue(() => h(VPrompt.PromptInput, null, () => [
    h(VPrompt.PromptInputBody, null, () => h(VPrompt.PromptInputTextarea)),
    h(VPrompt.PromptInputFooter, null, () => [
      h(VPrompt.PromptInputTools, null, () => h(VPrompt.PromptInputActionMenu, null, () => h(VPrompt.PromptInputActionMenuTrigger))),
      h(VPrompt.PromptInputSubmit, { status, onStop: () => {} }),
    ]),
  ]))

describe.each([["react", reactPrompt], ["vue", vuePrompt]] as const)("%s prompt-input", (_, render) => {
  it("names the field and its icon-only buttons in French", async () => {
    const html = await render()
    expect(html).toContain('placeholder="Posez votre question…"')
    expect(html).toContain('aria-label="Votre message"')
    expect(html).toContain('aria-label="Plus d’actions"')
    expect(html).toMatch(/aria-label="Envoyer"[^>]*type="submit"|type="submit"[^>]*aria-label="Envoyer"/)
  })
  it("turns submit into a stop button while generating", async () => {
    const html = await render("streaming")
    expect(html).toMatch(/aria-label="Arrêter la génération"[^>]*type="button"|type="button"[^>]*aria-label="Arrêter la génération"/)
  })
})
