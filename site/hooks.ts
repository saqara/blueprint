import { useEffect, useState, useSyncExternalStore } from "react"
import { FW_KEY, readFramework, withFramework, type Fw } from "./lib/framework"
import { parseRoute } from "./lib/route"
import { safeGet, safeSet } from "./lib/storage"
import { initialTheme, resolveTheme, THEME_KEY, type ThemeChoice } from "./lib/theme"

const subscribeHash = (cb: () => void) => { addEventListener("hashchange", cb); return () => removeEventListener("hashchange", cb) }

export function useRoute() {
  return parseRoute(useSyncExternalStore(subscribeHash, () => location.hash, () => ""))
}

export function useFramework(): [Fw, (fw: Fw) => void] {
  const [fw, setState] = useState<Fw>(() => readFramework(location.search, safeGet(FW_KEY)))
  const setFw = (next: Fw) => {
    setState(next)
    safeSet(FW_KEY, next)
    history.replaceState(null, "", withFramework(location.href, next))
  }
  // A framework restored from storage is written into the URL too.
  useEffect(() => {
    if (new URLSearchParams(location.search).get("fw") !== fw) history.replaceState(null, "", withFramework(location.href, fw))
  }, [fw])
  return [fw, setFw]
}

export function useTheme() {
  const [initial] = useState(() => initialTheme(safeGet(THEME_KEY), matchMedia("(prefers-color-scheme: dark)").matches))
  const [choice, setChoice] = useState<ThemeChoice>(initial.choice)
  const [resolved, setResolved] = useState<"light" | "dark">(initial.resolved)
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
