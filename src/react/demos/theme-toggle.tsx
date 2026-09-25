import { useState } from "react"
import { ThemeToggle } from "@/registry/react/ui/theme-toggle"

export default function ThemeToggleDemo() {
  const [theme, setTheme] = useState<"light" | "dark">(() => (typeof document !== "undefined" && document.documentElement.classList.contains("dark") ? "dark" : "light"))
  return <ThemeToggle theme={theme} onThemeChange={(t) => { setTheme(t); document.documentElement.classList.toggle("dark", t === "dark") }} />
}
