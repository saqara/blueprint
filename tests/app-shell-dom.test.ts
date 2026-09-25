// @vitest-environment happy-dom
import { act, createElement as e } from "react"
import { createRoot } from "react-dom/client"
import { createApp, h, nextTick } from "vue"
import { afterEach, describe, expect, it } from "vitest"
import { AppShellHeader as RHeader } from "../registry/react/blocks/app-shell-header"
import VHeader from "../registry/vue/blocks/AppShellHeader.vue"

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
const tick = () => new Promise((r) => setTimeout(r, 20))
const props = {
  nav: [{ id: "annuaire", label: "Mes entreprises" }],
  user: { name: "Camille Martin" },
  onSignOut: () => {},
  signOutLabel: "Déconnexion",
}
const cleanups: (() => unknown)[] = []
afterEach(async () => {
  for (const c of cleanups.splice(0)) await c()
  document.body.innerHTML = ""
})

async function mountReact(p: Record<string, unknown>) {
  const root = createRoot(document.body.appendChild(document.createElement("div")))
  await act(async () => root.render(e(RHeader as any, p, "Contenu")))
  cleanups.push(() => act(async () => root.unmount()))
  return async (fn: () => void) => { await act(async () => { fn(); await tick() }) }
}
async function mountVue(p: Record<string, unknown>) {
  const app = createApp({ render: () => h(VHeader as any, p, { default: () => "Contenu", logo: () => h("a", { href: "#/" }, "Accueil") }) })
  app.mount(document.body.appendChild(document.createElement("div")))
  cleanups.push(() => app.unmount())
  await nextTick()
  return async (fn: () => void) => { fn(); await nextTick(); await tick() }
}
const key = (el: Element, k: string) => el.dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true }))
const dialog = () => document.querySelector("[role=dialog]")

describe.each([
  ["react", () => mountReact({ ...props, logo: e("a", { href: "#/" }, "Accueil") })],
  ["vue", () => mountVue(props)],
])("%s app-shell-header (DOM)", (_, mount) => {
  it("passes signOutLabel to the user menu", async () => {
    const run = await mount()
    const trigger = document.querySelector<HTMLElement>("[data-slot=user-menu]")!
    await run(() => { trigger.focus(); key(trigger, "Enter") })
    expect(document.body.textContent).toContain("Déconnexion")
    expect(document.body.textContent).not.toContain("Se déconnecter")
  })
  it("closes the mobile sheet when the logo inside it is clicked", async () => {
    const run = await mount()
    await run(() => document.querySelector<HTMLElement>("[aria-label=Menu]")!.click())
    expect(dialog()).not.toBeNull()
    await run(() => dialog()!.querySelector<HTMLElement>("a[href='#/']")!.click())
    expect(dialog()).toBeNull()
  })
})
