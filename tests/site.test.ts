import { describe, expect, it } from "vitest"
import { parseRoute, toHash } from "../site/lib/route"
import { readThemeChoice, resolveTheme } from "../site/lib/theme"
import { readFramework } from "../site/lib/framework"
import reactManifest from "../registry.react.json"
import vueManifest from "../registry.vue.json"
import { BLOCKS, CATEGORIES, itemInfo, pageTitle } from "../site/catalog"

describe("parseRoute", () => {
  it.each([
    ["", { section: "home" }],
    ["#/", { section: "home" }],
    ["#/composants/button", { section: "composants", slug: "button" }],
    ["#/exemples/annuaire/", { section: "exemples", slug: "annuaire" }],
    ["#/blocs/login", { section: "blocs", slug: "login" }],
    ["#/demarrer/installation", { section: "demarrer", slug: "installation" }],
    ["#/composants", { section: "not-found" }],
    ["#/inconnu/x", { section: "not-found" }],
    ["#/composants/button/extra", { section: "not-found" }],
  ])("%s", (hash, route) => expect(parseRoute(hash)).toEqual(route))
  it("round-trips through toHash", () => {
    expect(toHash({ section: "home" })).toBe("#/")
    expect(toHash(parseRoute("#/composants/data-table"))).toBe("#/composants/data-table")
  })
})

describe("theme", () => {
  it("resolves auto from the OS preference", () => {
    expect([resolveTheme("auto", true), resolveTheme("auto", false), resolveTheme("light", true), resolveTheme("dark", false)]).toEqual(["dark", "light", "light", "dark"])
  })
  it("defaults to auto for missing or unknown stored values", () => {
    expect([readThemeChoice(null), readThemeChoice("bogus"), readThemeChoice("dark")]).toEqual(["auto", "auto", "dark"])
  })
})

describe("framework", () => {
  it("prefers the URL, then storage, then React", () => {
    expect(readFramework("?fw=vue", "react")).toBe("vue")
    expect(readFramework("?fw=angular", "vue")).toBe("vue")
    expect(readFramework("", null)).toBe("react")
  })
})

describe("catalog", () => {
  const ui = reactManifest.items.filter((i) => i.type === "registry:ui").map((i) => i.name)
  const listed = CATEGORIES.flatMap((c) => c.items)
  it("lists every UI item in exactly one category", () => {
    expect([...listed].sort()).toEqual([...ui].sort())
    expect(new Set(listed).size).toBe(listed.length)
  })
  it("lists every block", () => {
    expect([...BLOCKS].sort()).toEqual(reactManifest.items.filter((i) => i.type === "registry:block").map((i) => i.name).sort())
  })
  it("gives every UI item and block a description in both manifests", () => {
    for (const m of [reactManifest, vueManifest]) {
      const missing = m.items.filter((i) => ["registry:ui", "registry:block"].includes(i.type) && !("description" in i && i.description)).map((i) => i.name)
      expect(missing).toEqual([])
    }
  })
  it("reads titles from the manifest", () => {
    expect(itemInfo("data-table")?.title).toBe("Data Table")
  })
})

describe("pageTitle", () => {
  it.each([
    [{ section: "home" }, "Accueil"],
    [{ section: "demarrer", slug: "tokens" }, "Thème et tokens"],
    [{ section: "demarrer", slug: "ia" }, "Utiliser avec une IA"],
    [{ section: "composants", slug: "data-table" }, "Data Table"],
    [{ section: "blocs", slug: "login" }, "Login"],
    [{ section: "exemples", slug: "annuaire" }, "Annuaire fournisseurs"],
    [{ section: "composants", slug: "nope" }, "Introuvable"],
    [{ section: "not-found" }, "Introuvable"],
  ] as const)("%o → %s", (route, title) => expect(pageTitle(route)).toBe(title))
})

import { cssVarsFor } from "../site/pages/Tokens"

describe("cssVarsFor", () => {
  it("scopes a mode's tokens as CSS custom properties, whatever the page theme", () => {
    expect(cssVarsFor({ background: "#FFFFFF", "muted-foreground": "#57534E" })).toEqual({ "--background": "#FFFFFF", "--muted-foreground": "#57534E" })
  })
})

import { SAQARA_MADE } from "../site/catalog"

describe("review fixes", () => {
  it("treats a malformed escape as not-found instead of crashing", () => {
    expect(parseRoute("#/composants/%E0")).toEqual({ section: "not-found" })
  })
  it("derives Saqara-made items from the manifest (including the React stepper)", () => {
    const saqara = reactManifest.items.filter((i) => /\(Saqara\)\.?$/.test((i as { description?: string }).description ?? "")).map((i) => i.name)
    expect([...SAQARA_MADE].sort()).toEqual(saqara.sort())
    expect(SAQARA_MADE.has("stepper")).toBe(true)
  })
})
