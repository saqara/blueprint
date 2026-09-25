import { useEffect, useRef } from "react"
import { createApp, type Component } from "vue"

// Mounts a Vue component inside the React site; unmounted on change so listeners/toasts never pile up.
export function VueIsland({ component }: { component: Component }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const app = createApp(component)
    app.mount(ref.current!)
    return () => app.unmount()
  }, [component])
  // display: contents — the island adds no box, so demos lay out exactly like their React twins.
  return <div ref={ref} className="contents" />
}
