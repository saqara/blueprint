export type ThemeChoice = "light" | "dark" | "auto"
export const THEME_KEY = "blueprint-theme"

export function resolveTheme(choice: ThemeChoice, prefersDark: boolean): "light" | "dark" {
  return choice === "auto" ? (prefersDark ? "dark" : "light") : choice
}

export function readThemeChoice(stored: string | null): ThemeChoice {
  return stored === "light" || stored === "dark" ? stored : "auto"
}

// First render uses the real theme (the Toaster and islands get it right from the start).
export function initialTheme(stored: string | null, prefersDark: boolean) {
  const choice = readThemeChoice(stored)
  return { choice, resolved: resolveTheme(choice, prefersDark) }
}
