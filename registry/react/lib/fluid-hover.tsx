"use client"

import * as React from "react"
import { animate } from "motion"
import { cn } from "cn"
import { spring } from "@/registry/react/lib/springs"

// Fluid hover (from Fluid Functionalism): one highlight per list that glides to the active item
// instead of each item blinking its own background. The highlight's parent is the list container;
// the nearest positioned ancestor gets `relative isolate` (the highlight sits at -z-10, under the items).
// - "attribute": follows the item the primitive marks active (Radix/Reka data-highlighted, cmdk
//   data-selected), so keyboard navigation moves it too.
// - "pointer": follows the item under the pointer (tabs, sidebar, table rows).
// A fresh pointer entry fades in where it lands instead of sliding over from the last item.
export type FluidHoverOptions = {
  mode: "attribute" | "pointer"
  /** The items that can be lit. */
  items: string
  /** attribute mode: the active item (or something inside it). */
  active?: string
}

const { exit: _fastExit, ...fast } = spring.fast

// Offsets ignore transforms, so a popup still scaling in measures right; they are content-relative,
// so the highlight scrolls with the items.
function offsetIn(el: HTMLElement, origin: Element | null) {
  let x = 0, y = 0
  for (let e: HTMLElement | null = el; e && e !== origin; e = e.offsetParent as HTMLElement | null) {
    x += e.offsetLeft
    y += e.offsetTop
  }
  return { x, y }
}

export function fluidHover(highlight: HTMLElement, { mode, items, active }: FluidHoverOptions): () => void {
  const container = highlight.parentElement
  if (!container) return () => {}
  const reduced = typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches
  let lit: HTMLElement | null = null
  let fresh = true

  const move = (target: HTMLElement | null) => {
    if (target === lit) return
    lit = target
    if (!target) {
      fresh = true
      animate(highlight, { opacity: 0 }, { duration: spring.fast.exit.duration })
      return
    }
    const { x, y } = offsetIn(target, highlight.offsetParent)
    const box = { x, y, width: target.offsetWidth, height: target.offsetHeight }
    if (fresh || reduced) {
      fresh = false
      animate(highlight, box, { duration: 0 })
      animate(highlight, { opacity: 1 }, fast)
    } else {
      animate(highlight, { ...box, opacity: 1 }, fast)
    }
  }
  const itemOf = (el: EventTarget | Element | null) => {
    const item = el instanceof Element ? el.closest<HTMLElement>(items) : null
    return item && container.contains(item) ? item : null
  }
  const onEnter = () => { if (!lit) fresh = true }
  container.addEventListener("pointerenter", onEnter)

  if (mode === "attribute") {
    const sync = () => move(itemOf(active ? container.querySelector(active) : null))
    const observer = new MutationObserver(sync)
    observer.observe(container, { subtree: true, attributes: true, attributeFilter: ["data-highlighted", "data-selected", "data-state"] })
    sync()
    return () => { observer.disconnect(); container.removeEventListener("pointerenter", onEnter) }
  }
  const onMove = (e: PointerEvent) => move(itemOf(e.target))
  const onLeave = () => move(null)
  container.addEventListener("pointermove", onMove)
  container.addEventListener("pointerleave", onLeave)
  return () => {
    container.removeEventListener("pointerenter", onEnter)
    container.removeEventListener("pointermove", onMove)
    container.removeEventListener("pointerleave", onLeave)
  }
}

// Place it first inside the list container (`relative isolate`); it measures its siblings.
// `as="li"` inside a list (ul/ol), where a div is not allowed.
function FluidHighlight({ className, mode, items, active, as: Tag = "div" }: FluidHoverOptions & { className?: string; as?: "div" | "li" }) {
  const ref = React.useRef<HTMLElement>(null)
  React.useEffect(() => (ref.current ? fluidHover(ref.current, { mode, items, active }) : undefined), [mode, items, active])
  return <Tag ref={ref as React.RefObject<never>} aria-hidden data-slot="fluid-highlight" className={cn("pointer-events-none absolute top-0 left-0 -z-10 rounded-sm bg-accent opacity-0", className)} />
}

export { FluidHighlight }
