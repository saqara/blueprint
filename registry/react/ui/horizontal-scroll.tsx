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
  /** The scrolling element (e.g. the IntersectionObserver root, or to make it the vertical scroller too). */
  viewportRef?: React.Ref<HTMLDivElement>
  /** Attributes, class and handlers for the scrolling element. */
  viewportProps?: React.ComponentProps<"div"> & Record<`data-${string}`, string | undefined>
}

// Past this many pixels a press becomes a drag (below it, the click goes through to rows, links…).
const DRAG_THRESHOLD = 5

// Saqara: wide tables (Table / DataTable with container={false}) — the scrollbar stays reachable at the
// bottom of the screen, and the content can be dragged sideways.
function HorizontalScroll({ stickyScrollbar = true, dragToScroll = true, viewportRef, viewportProps, className, children, ...props }: HorizontalScrollProps) {
  const viewport = React.useRef<HTMLDivElement>(null)
  const bar = React.useRef<HTMLDivElement>(null)
  const drag = React.useRef<{ x: number; left: number; ratio: number; started?: boolean } | null>(null)
  const swallowClick = React.useRef(false)
  React.useImperativeHandle(viewportRef, () => viewport.current as HTMLDivElement, [])
  // Release explicitly: a capture left behind would keep retargeting clicks to the viewport.
  const release = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    drag.current = null
    setDragging(false)
  }
  const [size, setSize] = React.useState({ content: 0, visible: 0, track: 0, vertical: false })
  const [left, setLeft] = React.useState(0)
  const [dragging, setDragging] = React.useState(false)
  const overflow = size.content > size.visible + 1

  React.useEffect(() => {
    const el = viewport.current
    if (!el) return
    const measure = () => setSize({
      content: el.scrollWidth, visible: el.clientWidth, track: bar.current?.clientWidth ?? el.clientWidth,
      vertical: el.scrollHeight > el.clientHeight + 1,
    })
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
        data-slot="horizontal-scroll-viewport"
        {...viewportProps}
        ref={viewport}
        className={cn(
          "overflow-x-auto",
          // Only the horizontal native bar goes (the sticky bar replaces it); Firefox can't target one axis,
          // so there it is hidden only when the content doesn't also scroll vertically.
          stickyScrollbar && "[&::-webkit-scrollbar:horizontal]:h-0",
          stickyScrollbar && !size.vertical && "[scrollbar-width:none]",
          dragToScroll && overflow && (dragging ? "cursor-grabbing select-none" : "cursor-grab"),
          viewportProps?.className
        )}
        onScroll={(event) => { setLeft(event.currentTarget.scrollLeft); viewportProps?.onScroll?.(event) }}
        onPointerDown={(event) => {
          if (!dragToScroll || event.pointerType !== "mouse" || event.button !== 0) return
          if ((event.target as Element).closest(CONTROLS)) return
          // No capture yet: capturing now would retarget the click to the viewport (rows would never get it).
          drag.current = { x: event.clientX, left: event.currentTarget.scrollLeft, ratio: -1 }
        }}
        onPointerMove={(event) => {
          if (!drag.current) return
          const dx = event.clientX - drag.current.x
          if (!drag.current.started) {
            if (Math.abs(dx) <= DRAG_THRESHOLD) return
            drag.current.started = true
            event.currentTarget.setPointerCapture?.(event.pointerId)
            setDragging(true)
          }
          event.currentTarget.scrollLeft = drag.current.left + drag.current.ratio * dx
        }}
        onPointerUp={(event) => {
          if (drag.current?.started) swallowClick.current = true
          release(event)
        }}
        onPointerCancel={release}
        onClickCapture={(event) => {
          // The click that ends a real drag is not a click on what lies under the pointer.
          if (!swallowClick.current) return
          swallowClick.current = false
          event.preventDefault()
          event.stopPropagation()
        }}
      >
        {children}
      </div>
      {stickyScrollbar && overflow && (
        <div
          ref={bar}
          data-slot="horizontal-scroll-bar"
          aria-hidden="true"
          className="sticky bottom-0 z-10 h-3 shrink-0 bg-background/80 backdrop-blur-sm"
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
