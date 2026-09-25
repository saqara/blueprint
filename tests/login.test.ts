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
  it("centers the logo and title (CardHeader is a grid)", async () => {
    expect(await render({})).toMatch(/data-slot="card-header"[^>]*class="[^"]*justify-items-center|class="[^"]*justify-items-center[^"]*"[^>]*data-slot="card-header"/)
  })
  it("titles the page with an h1, in both states", async () => {
    expect(await render({})).toMatch(/<h1[^>]*>(<!--[^>]*-->)?Connexion/)
    const sent = await render({ password: false, magicLink: true, status: "sent", sentTitle: "Lien envoyé" })
    expect(sent).toMatch(/<h1[^>]*>(<!--[^>]*-->)?Lien envoyé/)
  })
  it("takes an email placeholder and a hint tied to the field", async () => {
    const html = await render({ emailPlaceholder: "prenom.nom@exemple.fr", emailHint: "Votre adresse professionnelle." })
    expect(html).toContain('placeholder="prenom.nom@exemple.fr"')
    const hintId = html.match(/id="([^"]+)"[^>]*>(<!--[^>]*-->)?Votre adresse professionnelle\./)![1]
    expect(html).toMatch(new RegExp(`type="email"[^>]*aria-describedby="${hintId}"|aria-describedby="${hintId}"[^>]*type="email"`))
  })
  it("spins only the button that is loading", async () => {
    const sso = await render({ sso: { label: "SSO" }, status: "loading", loadingAction: "sso" })
    expect(sso).toMatch(/<button[^>]*aria-busy="true"[^>]*>(?:(?!<\/button>)[\s\S])*SSO/)
    expect(sso).not.toMatch(/aria-busy="true"[^>]*>(?:(?!<\/button>)[\s\S])*Se connecter/)
    const form = await render({ sso: { label: "SSO" }, status: "loading" })
    expect(form).toMatch(/aria-busy="true"[^>]*>(?:(?!<\/button>)[\s\S])*Se connecter/)
  })
  it("lets the error be dismissed when handled", async () => {
    expect(await render({ error: "Erreur" })).not.toContain('aria-label="Fermer"')
    expect(await render({ error: "Erreur", onErrorDismiss: () => {} })).toContain('aria-label="Fermer"')
  })
  it("shows the error, a resend countdown and a custom reset label once sent", async () => {
    const html = await render({ password: false, magicLink: true, status: "sent", error: "Envoi impossible.", onResend: () => {}, onReset: () => {}, resetLabel: "Retour au formulaire" })
    expect(html).toMatch(/role="alert"[\s\S]*Envoi impossible\./)
    // The attribute, not the `disabled:` Tailwind variants in the class.
    expect(html).toMatch(/<button[^>]*\sdisabled(=""|\s|>)[^>]*>?(?:(?!<\/button>)[\s\S])*Renvoyer le lien dans 60(<!--[^>]*-->)?\s*s/)
    expect(html).toContain("Retour au formulaire")
    expect(await render({ password: false, magicLink: true, status: "sent", onResend: () => {}, resendCooldown: 0 })).toMatch(/<button(?![^>]*\sdisabled(=""|\s|>))[^>]*>(<!--[^>]*-->)*\s*Renvoyer le lien\s*(<!--[^>]*-->)*<\/button>/)
  })
})
