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
})
