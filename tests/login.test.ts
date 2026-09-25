import { createElement as e } from "react"
import { renderToString } from "react-dom/server"
import { createSSRApp, h } from "vue"
import { renderToString as renderVue } from "vue/server-renderer"
import { describe, expect, it } from "vitest"
import { Login as RLogin } from "../registry/react/blocks/login"
import VLogin from "../registry/vue/blocks/Login.vue"

describe.each([
  ["react", async (p: Record<string, unknown>) => renderToString(e(RLogin as any, p))],
  ["vue", async (p: Record<string, unknown>) => renderVue(createSSRApp({ render: () => h(VLogin as any, p) }))],
])("%s login", (_, render) => {
  it("defaults to email + password", async () => {
    const html = await render({})
    expect(html).toContain("Connexion")
    expect(html).toContain('type="email"')
    expect(html).toContain('type="password"')
    expect(html).toContain("Se connecter")
    expect(html).not.toContain("Recevoir un lien de connexion")
  })
  it("offers the forgot-password link only when handled", async () => {
    expect(await render({})).not.toContain("Mot de passe oublié")
    expect(await render({ onForgotPassword: () => {} })).toContain("Mot de passe oublié")
  })
  it("supports magic link only", async () => {
    const html = await render({ password: false, magicLink: true })
    expect(html).not.toContain('type="password"')
    expect(html).toContain("Recevoir un lien de connexion")
  })
  it("puts SSO first with an « ou » separator when another method exists", async () => {
    const html = await render({ sso: { label: "Se connecter avec SSO" } })
    expect(html.indexOf("Se connecter avec SSO")).toBeLessThan(html.indexOf('type="email"'))
    expect(html).toMatch(/>ou</)
    expect(await render({ password: false, sso: { label: "SSO" } })).not.toMatch(/>ou</)
  })
  it("announces errors", async () => {
    expect(await render({ error: "Identifiants incorrects." })).toMatch(/role="alert"[^>]*>[\s\S]*Identifiants incorrects\./)
  })
  it("shows the check-your-inbox screen once the link is sent", async () => {
    const html = await render({ password: false, magicLink: true, status: "sent", onReset: () => {} })
    expect(html).toContain("Vérifiez votre boîte mail")
    expect(html).toContain("Utiliser une autre adresse")
    expect(html).not.toContain('type="email"')
  })
  it("locks inputs and the forgot-password link while loading", async () => {
    const html = await render({ status: "loading", onForgotPassword: () => {} })
    expect(html).toMatch(/<input[^>]*type="email"[^>]*disabled|<input[^>]*disabled[^>]*type="email"/)
    expect(html).toMatch(/<input[^>]*type="password"[^>]*disabled|<input[^>]*disabled[^>]*type="password"/)
    expect(html).toMatch(/<button[^>]*disabled[^>]*>\s*Mot de passe oublié/)
  })
})
