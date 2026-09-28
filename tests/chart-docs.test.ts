import { cn as reactCn } from "cn"
import { describe, expect, it } from "vitest"
import { cn as vueCn } from "../lib/utils"

// The documented way to colour axis labels: a class on ChartContainer replaces the default muted one.
describe("chart axis label override", () => {
  it("react: [&_.recharts-cartesian-axis-tick_text]:fill-foreground wins", () => {
    const merged = reactCn("text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground", "[&_.recharts-cartesian-axis-tick_text]:fill-foreground")
    expect(merged).not.toContain("fill-muted-foreground")
    expect(merged).toContain("[&_.recharts-cartesian-axis-tick_text]:fill-foreground")
  })
  it("vue: [&_.tick_text]:!fill-foreground wins", () => {
    const merged = vueCn("text-xs [&_.tick_text]:!fill-muted-foreground", "[&_.tick_text]:!fill-foreground")
    expect(merged).not.toContain("fill-muted-foreground")
    expect(merged).toContain("[&_.tick_text]:!fill-foreground")
  })
})
