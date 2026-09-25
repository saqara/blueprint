import { describe, expect, it } from "vitest"
import { badgeVariants as reactBadge } from "../registry/react/ui/badge"
import { alertVariants as reactAlert } from "../registry/react/ui/alert"
import { badgeVariants as vueBadge } from "../registry/vue/ui/badge"
import { alertVariants as vueAlert } from "../registry/vue/ui/alert"

const fws = { react: { badge: reactBadge, alert: reactAlert }, vue: { badge: vueBadge, alert: vueAlert } }

describe.each(Object.entries(fws))("%s", (_, { badge, alert }) => {
  it.each(["success", "warning", "info", "identity"] as const)("badge %s uses its token", (v) => {
    expect(badge({ variant: v })).toContain(`bg-${v}`)
    expect(badge({ variant: v })).toContain(`text-${v}-foreground`)
  })
  it.each(["success", "warning", "info"] as const)("alert %s uses its token", (v) => {
    expect(alert({ variant: v })).toContain(`border-${v}`)
    expect(alert({ variant: v })).toContain(`[&>svg]:text-${v}`)
  })
})
