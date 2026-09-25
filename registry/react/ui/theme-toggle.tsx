import { MoonIcon, SunIcon } from "lucide-react"
import { Button } from "@/registry/react/ui/button"

type Theme = "light" | "dark"
type ThemeToggleProps = { theme: Theme; onThemeChange: (theme: Theme) => void; label?: string; className?: string }

// Saqara: presentational only — the app keeps its own theme state/storage.
function ThemeToggle({ theme, onThemeChange, label = "Basculer le thème", className }: ThemeToggleProps) {
  return (
    <Button variant="ghost" size="icon" data-slot="theme-toggle" aria-label={label} aria-pressed={theme === "dark"} className={className}
      onClick={() => onThemeChange(theme === "dark" ? "light" : "dark")}>
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </Button>
  )
}

export { ThemeToggle }
