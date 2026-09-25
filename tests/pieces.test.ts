import { createElement as e } from "react"
import { renderToString } from "react-dom/server"
import { createSSRApp, h } from "vue"
import { renderToString as renderVue } from "vue/server-renderer"
import { describe, expect, it } from "vitest"
import { SaqaraLogo as RLogo } from "../registry/react/ui/saqara-logo"
import { ThemeToggle as RToggle } from "../registry/react/ui/theme-toggle"
import { initials as rInitials } from "../registry/react/ui/user-menu"
import { SaqaraLogo as VLogo } from "../registry/vue/ui/saqara-logo"
import { ThemeToggle as VToggle } from "../registry/vue/ui/theme-toggle"
import { initials as vInitials } from "../registry/vue/ui/user-menu"

const vue = (c: any, props: Record<string, unknown> = {}) => renderVue(createSSRApp({ render: () => h(c, props) }))

describe.each([["react", rInitials], ["vue", vInitials]] as const)("%s initials", (_, initials) => {
  it("takes first and last word, uppercased", () => {
    expect(initials("Camille Martin")).toBe("CM")
    expect(initials("Jean-Paul Martin Dupont")).toBe("JD")
    expect(initials("  élodie  ")).toBe("ÉL")
    expect(initials("")).toBe("?")
  })
})

describe("saqara-logo", () => {
  it.each([
    ["react", async (p: object) => renderToString(e(RLogo, p))],
    ["vue", async (p: object) => vue(VLogo, p as Record<string, unknown>)],
  ])("%s paints the mark in identity + currentColor, text optional", async (_, render) => {
    const mark = await render({})
    expect(mark).toContain("fill-identity")
    expect(mark).toContain('fill="currentColor"')
    expect(mark).toContain('aria-label="Saqara"')
    expect(await render({ withText: true })).toMatch(/<span>Saqara<\/span>/)
  })
})

describe("theme-toggle", () => {
  it.each([
    ["react", async (theme: string) => renderToString(e(RToggle, { theme: theme as "light", onThemeChange: () => {} }))],
    ["vue", async (theme: string) => vue(VToggle, { theme })],
  ])("%s exposes its state through aria-pressed", async (_, render) => {
    expect(await render("dark")).toContain('aria-pressed="true"')
    expect(await render("light")).toContain('aria-pressed="false"')
    expect(await render("light")).toContain('aria-label="Basculer le thème"')
  })
})
