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
  return <div ref={ref} />
}
