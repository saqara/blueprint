import { createElement as e } from "react"
import { renderToString } from "react-dom/server"
import { createSSRApp, h } from "vue"
import { renderToString as renderVue } from "vue/server-renderer"
import { describe, expect, it } from "vitest"
import { AiChat as RAiChat } from "../registry/react/blocks/ai-chat"
import VAiChat from "../registry/vue/blocks/AiChat.vue"

const noop = () => {}
const messages = [
  { id: "1", role: "user" as const, text: "Où sont nos fournisseurs ?" },
  { id: "2", role: "assistant" as const, text: "Surtout à Lyon." },
]

describe.each([
  ["react", (p: Record<string, unknown>) => renderToString(e(RAiChat, { onSubmit: noop, messages: [], ...p }))],
  ["vue", (p: Record<string, unknown>) => renderVue(createSSRApp({ render: () => h(VAiChat, { onSubmit: noop, messages: [], ...p }) }))],
] as const)("%s ai-chat block", (_, render) => {
  it("starts empty, with the suggestions and a named log", async () => {
    const html = await render({ suggestions: ["Top 10 des villes"] })
    expect(html).toContain("Comment puis-je vous aider ?")
    expect(html).toContain("Top 10 des villes")
    expect(html).toContain('aria-label="Conversation avec l’assistant"')
    expect(html).not.toContain("Plus d’actions")
  })
  it("shows messages with a copy action on answers, and hides the suggestions", async () => {
    const html = await render({ messages, suggestions: ["Top 10 des villes"], attachments: true })
    expect(html).toContain("Où sont nos fournisseurs ?")
    expect(html).toMatch(/data-slot="message-response"[^>]*>(<!--[^>]*-->)*<p>Surtout à Lyon\.<\/p>/)
    expect(html).toContain("Copier")
    expect(html).not.toContain("Top 10 des villes")
    expect(html).toContain("Plus d’actions")
  })
  it("says it is thinking while waiting for the first token, with a stop button", async () => {
    const html = await render({ messages: messages.slice(0, 1), status: "submitted", onStop: noop })
    expect(html).toContain("Réflexion…")
    expect(html).toContain('aria-label="Arrêter la génération"')
  })
  it("locks sending while generating when it cannot stop", async () => {
    expect(await render({ messages: messages.slice(0, 1), status: "streaming" })).toMatch(/<button[^>]*disabled[^>]*aria-label="Arrêter la génération"|<button[^>]*aria-label="Arrêter la génération"[^>]*disabled/)
  })
})
