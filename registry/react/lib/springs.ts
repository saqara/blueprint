// Saqara motion tiers (from Fluid Functionalism): the bigger the thing that moves, the slower the spring.
// Never hand-write a duration: pass `spring.<tier>` as a Motion transition, `spring.<tier>.exit` on exit.
// fast: hover, fades, tooltips, focus rings. moderate: dropdowns, tabs, panels that must land exactly.
// slow: dialogs, sheets, large surfaces. Exits are plain tweens, one tier quicker than the enter.
export const spring = {
  fast: { type: "spring", duration: 0.08, bounce: 0, exit: { duration: 0.06, ease: "easeIn" } },
  moderate: { type: "spring", duration: 0.16, bounce: 0, exit: { duration: 0.12, ease: "easeIn" } },
  slow: { type: "spring", duration: 0.24, bounce: 0.12, exit: { duration: 0.16, ease: "easeIn" } },
} as const

export type SpringTier = keyof typeof spring

// Exit duration in ms plus a 100 ms buffer, for timers that guard an exit animation.
export const exitFallbackMs = (tier: SpringTier) => spring[tier].exit.duration * 1000 + 100
