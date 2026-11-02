import { describe, expect, it } from "vitest"
import { badgeVariants as reactBadge } from "../registry/react/ui/badge"
import { alertVariants as reactAlert } from "../registry/react/ui/alert"
import { badgeVariants as vueBadge } from "../registry/vue/ui/badge"
import { alertVariants as vueAlert } from "../registry/vue/ui/alert"

const fws = { react: { badge: reactBadge, alert: reactAlert }, vue: { badge: vueBadge, alert: vueAlert } }

describe.each(Object.entries(fws))("%s", (_, { badge, alert }) => {
  it.each(["success", "warning", "info"] as const)("badge %s uses its soft token", (v) => {
    expect(badge({ variant: v })).toContain(`bg-${v}/15`)
    expect(badge({ variant: v })).toContain(`text-${v}-text`)
  })
  it("badge identity stays solid", () => {
    expect(badge({ variant: "identity" })).toContain("bg-identity")
    expect(badge({ variant: "identity" })).toContain("text-identity-foreground")
  })
  it.each(["success", "warning", "info"] as const)("alert %s uses its token", (v) => {
    expect(alert({ variant: v })).toContain(`border-${v}`)
    expect(alert({ variant: v })).toContain(`[&>svg]:text-${v}`)
  })
})
