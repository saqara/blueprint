import * as React from "react"

const MOBILE_BREAKPOINT = 768

// Saqara: subscribes to the media query (no setState in an effect: react-hooks v7 flags it);
// `breakpoint` lets a shell switch at another width (e.g. lg).
export function useIsMobile(breakpoint = MOBILE_BREAKPOINT) {
  const query = `(max-width: ${breakpoint - 1}px)`
  const subscribe = React.useCallback((onChange: () => void) => {
    const mql = window.matchMedia(query)
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [query])
  return React.useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false)
}
