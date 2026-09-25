import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { contrastRatio, tokenErrors, type Tokens } from "../scripts/lib/contrast.ts"

const base = { theme: {}, css: {}, contrastExceptions: [] }

describe("contrastRatio", () => {
  it("is 21 for white on black", () => expect(contrastRatio("#FFFFFF", "#000000")).toBeCloseTo(21, 1))
  it("matches the spec value for white on brand red", () => expect(contrastRatio("#FFFFFF", "#F04632")).toBeCloseTo(3.73, 2))
  it("is symmetric", () => expect(contrastRatio("#F04632", "#FFFFFF")).toBe(contrastRatio("#FFFFFF", "#F04632")))
})

describe("tokenErrors", () => {
  it("accepts the real tokens", () => {
    const t: Tokens = JSON.parse(readFileSync("tokens/theme.json", "utf8"))
    expect(tokenErrors(t)).toEqual([])
  })

  it("flags a low-contrast pair in each mode", () => {
    const vars = { a: "#FFFFFF", "a-foreground": "#EEEEEE" }
    const errors = tokenErrors({ ...base, light: vars, dark: vars })
    expect(errors).toHaveLength(2)
    expect(errors[0]).toContain("a-foreground on a")
  })

  it("tolerates declared exceptions", () => {
    const vars = { a: "#FFFFFF", "a-foreground": "#EEEEEE" }
    expect(tokenErrors({ ...base, contrastExceptions: ["a"], light: vars, dark: vars })).toEqual([])
  })

  it("rejects non #RRGGBB colors, naming the key", () => {
    const light = { a: "#FFF", b: "oklch(0.5 0 0)" }
    const errors = tokenErrors({ ...base, light, dark: light })
    expect(errors.some((e) => e.includes("light.a"))).toBe(true)
    expect(errors.some((e) => e.includes("light.b"))).toBe(true)
  })

  it("accepts a per-mode shadow color that is not hex", () => {
    const light = { shadow: "rgba(155,154,154,.3)" }, dark = { shadow: "rgba(0,0,0,.6)" }
    expect(tokenErrors({ ...base, light, dark })).toEqual([])
  })

  it("defines the sidebar palette in both modes", () => {
    const t: Tokens = JSON.parse(readFileSync("tokens/theme.json", "utf8"))
    const keys = ["sidebar", "sidebar-foreground", "sidebar-primary", "sidebar-primary-foreground", "sidebar-accent", "sidebar-accent-foreground", "sidebar-border", "sidebar-ring"]
    for (const mode of ["light", "dark"] as const) expect(keys.filter((k) => !(k in t[mode]))).toEqual([])
  })

  it("rejects keys missing from one mode", () => {
    const errors = tokenErrors({ ...base, light: { a: "#FFFFFF", b: "#000000" }, dark: { a: "#FFFFFF" } })
    expect(errors).toContain("dark.b: missing (present in light)")
  })

  it("checks destructive used as text (field errors) on background and card", () => {
    const vars = { background: "#161925", card: "#1F2230", destructive: "#C2002C" }
    const errors = tokenErrors({ ...base, light: vars, dark: vars })
    expect(errors).toContain("light: destructive on background = 2.78:1 (< 4.5)")
    expect(errors.some((e) => e.includes("destructive on card"))).toBe(true)
  })

  it("checks muted-foreground on background", () => {
    const vars = { background: "#FFFFFF", "muted-foreground": "#EEEEEE" }
    expect(tokenErrors({ ...base, light: vars, dark: vars })[0]).toContain("muted-foreground on background")
  })
  it("checks X-text on background, card and the bg-X/10 tint", () => {
    const vars = { background: "#FFFFFF", card: "#FFFFFF", success: "#6EBD71", "success-text": "#6EBD71" }
    const errors = tokenErrors({ ...base, light: vars, dark: vars })
    expect(errors).toContain("light: success-text on background = 2.29:1 (< 4.5)")
    expect(errors.some((e) => e.includes("success-text on success/10 over background"))).toBe(true)
    const fixed = { ...vars, "success-text": "#2F7F36" }
    expect(tokenErrors({ ...base, light: fixed, dark: fixed })).toEqual([])
  })

  it("gives every semantic colour a legible text token", () => {
    const t: Tokens = JSON.parse(readFileSync("tokens/theme.json", "utf8"))
    for (const k of ["success", "warning", "info", "identity", "destructive"]) {
      expect(t.light[`${k}-text`]).toBeDefined()
      expect(t.dark[`${k}-text`]).toBeDefined()
    }
  })

  it("keeps sidebar borders distinct from the sidebar accent in dark mode", () => {
    const t: Tokens = JSON.parse(readFileSync("tokens/theme.json", "utf8"))
    expect(t.dark["sidebar-border"]).not.toBe(t.dark["sidebar-accent"])
  })
})
