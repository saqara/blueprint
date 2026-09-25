import { useEffect, useState, useSyncExternalStore } from "react"
import { FW_KEY, readFramework, type Fw } from "./lib/framework"
import { parseRoute } from "./lib/route"
import { safeGet, safeSet } from "./lib/storage"
import { readThemeChoice, resolveTheme, THEME_KEY, type ThemeChoice } from "./lib/theme"

const subscribeHash = (cb: () => void) => { addEventListener("hashchange", cb); return () => removeEventListener("hashchange", cb) }

export function useRoute() {
  return parseRoute(useSyncExternalStore(subscribeHash, () => location.hash, () => ""))
}

export function useFramework(): [Fw, (fw: Fw) => void] {
  const [fw, setState] = useState<Fw>(() => readFramework(location.search, safeGet(FW_KEY)))
  const setFw = (next: Fw) => {
    setState(next)
    safeSet(FW_KEY, next)
    const url = new URL(location.href)
    url.searchParams.set("fw", next)
    history.replaceState(null, "", url)
  }
  return [fw, setFw]
}

export function useTheme() {
  const [choice, setChoice] = useState<ThemeChoice>(() => readThemeChoice(safeGet(THEME_KEY)))
  const [resolved, setResolved] = useState<"light" | "dark">("light")
  useEffect(() => {
    const media = matchMedia("(prefers-color-scheme: dark)")
    const apply = () => {
      const theme = resolveTheme(choice, media.matches)
      document.documentElement.classList.toggle("dark", theme === "dark")
      setResolved(theme)
    }
    apply()
    safeSet(THEME_KEY, choice)
    media.addEventListener("change", apply)
    return () => media.removeEventListener("change", apply)
  }, [choice])
  return { choice, setChoice, resolved }
}
