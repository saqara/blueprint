"use client"

import * as React from "react"
import { cn } from "cn"

// A drag that starts on a control belongs to the control.
const CONTROLS = "a, button, input, select, textarea, label, [role=button], [role=checkbox], [contenteditable=true]"

type HorizontalScrollProps = React.ComponentProps<"div"> & {
  /** A horizontal scrollbar stuck to the bottom of the viewport while the content overflows. */
  stickyScrollbar?: boolean
  /** Drag with the mouse to scroll (touch keeps its native scroll). */
  dragToScroll?: boolean
}

// Saqara: wide tables (Table / DataTable with container={false}) — the scrollbar stays reachable at the
// bottom of the screen, and the content can be dragged sideways.
function HorizontalScroll({ stickyScrollbar = true, dragToScroll = true, className, children, ...props }: HorizontalScrollProps) {
  const viewport = React.useRef<HTMLDivElement>(null)
  const bar = React.useRef<HTMLDivElement>(null)
  const drag = React.useRef<{ x: number; left: number; ratio: number } | null>(null)
  const [size, setSize] = React.useState({ content: 0, visible: 0, track: 0 })
  const [left, setLeft] = React.useState(0)
  const [dragging, setDragging] = React.useState(false)
  const overflow = size.content > size.visible + 1

  React.useEffect(() => {
    const el = viewport.current
    if (!el) return
    const measure = () => setSize({ content: el.scrollWidth, visible: el.clientWidth, track: bar.current?.clientWidth ?? el.clientWidth })
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    if (el.firstElementChild) observer.observe(el.firstElementChild)
    return () => observer.disconnect()
  }, [])

  // Custom thumb: native overlay scrollbars (macOS) hide themselves, a sticky bar must stay visible.
  const thumb = Math.max(24, size.content ? (size.track * size.visible) / size.content : 0)
  const free = Math.max(1, size.track - thumb)
  const scrollable = Math.max(1, size.content - size.visible)
  const thumbLeft = (left / scrollable) * free

  return (
    <div data-slot="horizontal-scroll" className={cn("relative", className)} {...props}>
      <div
        ref={viewport}
        data-slot="horizontal-scroll-viewport"
        className={cn(
          "overflow-x-auto",
          stickyScrollbar && "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          dragToScroll && overflow && (dragging ? "cursor-grabbing select-none" : "cursor-grab")
        )}
        onScroll={(event) => setLeft(event.currentTarget.scrollLeft)}
        onPointerDown={(event) => {
          if (!dragToScroll || event.pointerType !== "mouse" || event.button !== 0) return
          if ((event.target as Element).closest(CONTROLS)) return
          drag.current = { x: event.clientX, left: event.currentTarget.scrollLeft, ratio: -1 }
          event.currentTarget.setPointerCapture?.(event.pointerId)
          setDragging(true)
        }}
        onPointerMove={(event) => {
          if (!drag.current) return
          event.currentTarget.scrollLeft = drag.current.left + drag.current.ratio * (event.clientX - drag.current.x)
        }}
        onPointerUp={() => { drag.current = null; setDragging(false) }}
        onPointerCancel={() => { drag.current = null; setDragging(false) }}
      >
        {children}
      </div>
      {stickyScrollbar && overflow && (
        <div
          ref={bar}
          data-slot="horizontal-scroll-bar"
          aria-hidden="true"
          className="sticky bottom-0 z-10 h-3 bg-background/80 backdrop-blur-sm"
          onPointerDown={(event) => {
            // A click on the track centres the thumb there.
            if (!viewport.current || event.target !== event.currentTarget) return
            const x = event.clientX - event.currentTarget.getBoundingClientRect().left - thumb / 2
            viewport.current.scrollLeft = (Math.min(Math.max(x, 0), free) / free) * scrollable
          }}
        >
          <div
            data-slot="horizontal-scroll-thumb"
            className="absolute top-0.5 bottom-0.5 cursor-grab rounded-full bg-border transition-colors hover:bg-muted-foreground/40 active:cursor-grabbing"
            style={{ width: `${thumb}px`, left: `${thumbLeft}px` }}
            onPointerDown={(event) => {
              if (!viewport.current) return
              event.stopPropagation()
              drag.current = { x: event.clientX, left: viewport.current.scrollLeft, ratio: scrollable / free }
              event.currentTarget.setPointerCapture?.(event.pointerId)
            }}
            onPointerMove={(event) => {
              if (!drag.current || !viewport.current) return
              viewport.current.scrollLeft = drag.current.left + drag.current.ratio * (event.clientX - drag.current.x)
            }}
            onPointerUp={() => { drag.current = null }}
            onPointerCancel={() => { drag.current = null }}
          />
        </div>
      )}
    </div>
  )
}

export { HorizontalScroll }
