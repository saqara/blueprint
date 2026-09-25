export type CssTree = { [selector: string]: CssTree | string }
export type Tokens = {
  light: Record<string, string>
  dark: Record<string, string>
  theme: Record<string, string>
  css: CssTree
  contrastExceptions: string[]
}

const HEX = /^#[0-9A-Fa-f]{6}$/
// Per-mode vars that are not #RRGGBB colors (no contrast check, no Tailwind color utility).
export const NON_COLOR = new Set(["radius", "shadow"])

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

// What bg-X/10 renders: X at 10% alpha, composited over a surface in sRGB.
function tint(color: string, surface: string, alpha = 0.1): string {
  return "#" + [1, 3, 5].map((i) => {
    const c = parseInt(color.slice(i, i + 2), 16), s = parseInt(surface.slice(i, i + 2), 16)
    return Math.round(c * alpha + s * (1 - alpha)).toString(16).padStart(2, "0")
  }).join("")
}

export function tokenErrors(t: Tokens): string[] {
  const errors: string[] = []
  const modes = { light: t.light, dark: t.dark }
  for (const [mode, vars] of Object.entries(modes)) {
    const other = mode === "light" ? t.dark : t.light
    for (const k of Object.keys(other)) {
      if (!(k in vars)) errors.push(`${mode}.${k}: missing (present in ${mode === "light" ? "dark" : "light"})`)
    }
    const bad = Object.entries(vars).filter(([k, v]) => !NON_COLOR.has(k) && !HEX.test(v))
    for (const [k, v] of bad) errors.push(`${mode}.${k}: "${v}" is not #RRGGBB`)
    if (bad.length) continue

    const pairs = Object.keys(vars)
      .filter((k) => vars[`${k}-foreground`])
      .map((k) => [k, `${k}-foreground`])
    // Tokens that components also use as plain text on page surfaces (hints, field errors).
    for (const bg of ["background", "card"]) {
      for (const fg of ["muted-foreground", "destructive"]) if (vars[bg] && vars[fg]) pairs.push([bg, fg])
    }
    for (const [bg, fg] of pairs) {
      const ratio = contrastRatio(vars[bg], vars[fg])
      if (ratio < 4.5 && !t.contrastExceptions.includes(bg)) {
        errors.push(`${mode}: ${fg} on ${bg} = ${ratio.toFixed(2)}:1 (< 4.5)`)
      }
    }
    // X-text: the colour used as text, on page surfaces and on its own tint (tinted badges, statuses).
    for (const fg of Object.keys(vars).filter((k) => k.endsWith("-text"))) {
      const base = fg.slice(0, -"-text".length)
      for (const surface of ["background", "card"].filter((k) => vars[k])) {
        const checks: [string, string][] = [[surface, vars[surface]]]
        if (vars[base]) checks.push([`${base}/10 over ${surface}`, tint(vars[base], vars[surface])])
        for (const [label, bg] of checks) {
          const ratio = contrastRatio(bg, vars[fg])
          if (ratio < 4.5) errors.push(`${mode}: ${fg} on ${label} = ${ratio.toFixed(2)}:1 (< 4.5)`)
        }
      }
    }
  }
  return errors
}
