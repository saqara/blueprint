import { describe, expect, it } from "vitest"
import { parseRoute, toHash } from "../site/lib/route"
import { readThemeChoice, resolveTheme } from "../site/lib/theme"
import { readFramework } from "../site/lib/framework"

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
