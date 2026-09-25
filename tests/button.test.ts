import { createElement as e } from "react"
import { renderToString } from "react-dom/server"
import { createSSRApp, h } from "vue"
import { renderToString as renderVue } from "vue/server-renderer"
import { describe, expect, it } from "vitest"
import { Button as RButton } from "../registry/react/ui/button"
import { Button as VButton } from "../registry/vue/ui/button"

// Regression (#1): asChild must hand a single element to the Slot, loading or not.
describe("button asChild", () => {
  it.each([false, true])("react renders the child link (loading=%s)", (loading) => {
    const html = renderToString(e(RButton, { asChild: true, loading }, e("a", { href: "#/" }, "Accueil")))
    expect(html).toMatch(/^<a [^>]*href="#\/"[^>]*>Accueil<\/a>$/)
  })
  it.each([false, true])("vue renders the child link (loading=%s)", async (loading) => {
    const html = await renderVue(createSSRApp({ render: () => h(VButton, { asChild: true, loading }, () => h("a", { href: "#/" }, "Accueil")) }))
    expect(html).toMatch(/<a [^>]*href="#\/"[^>]*>Accueil<\/a>/)
    expect(html).not.toContain("<button")
  })
  it("still shows the spinner on a real loading button", () => {
    expect(renderToString(e(RButton, { loading: true }, "Envoyer"))).toMatch(/aria-busy="true"[\s\S]*<svg/)
  })
})
