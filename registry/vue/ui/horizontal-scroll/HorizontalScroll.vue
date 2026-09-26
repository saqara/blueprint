<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { computed, onBeforeUnmount, onMounted, ref } from "vue"
import { cn } from "@/lib/utils"

// Saqara: wide tables (Table / DataTable with :container="false") — the scrollbar stays reachable at the
// bottom of the screen, and the content can be dragged sideways.
const props = withDefaults(defineProps<{
  /** A horizontal scrollbar stuck to the bottom of the viewport while the content overflows. */
  stickyScrollbar?: boolean
  /** Drag with the mouse to scroll (touch keeps its native scroll). */
  dragToScroll?: boolean
  /** Called with the scrolling element (e.g. the IntersectionObserver root); also exposed as `viewport`. */
  viewportRef?: (el: HTMLElement | null) => void
  /** Attributes and class for the scrolling element. */
  viewportProps?: Record<string, unknown>
  class?: HTMLAttributes["class"]
}>(), { stickyScrollbar: true, dragToScroll: true })

// Past this many pixels a press becomes a drag (below it, the click goes through to rows, links…).
const DRAG_THRESHOLD = 5

// A drag that starts on a control belongs to the control.
const CONTROLS = "a, button, input, select, textarea, label, [role=button], [role=checkbox], [contenteditable=true]"

const viewport = ref<HTMLElement>()
const bar = ref<HTMLElement>()
const size = ref({ content: 0, visible: 0, track: 0, vertical: false })
const left = ref(0)
const dragging = ref(false)
const overflow = computed(() => size.value.content > size.value.visible + 1)
let drag: { x: number, left: number, ratio: number, started?: boolean } | null = null
let swallowClick = false
defineExpose({ viewport })
let observer: ResizeObserver | undefined

// Custom thumb: native overlay scrollbars (macOS) hide themselves, a sticky bar must stay visible.
const thumb = computed(() => Math.max(24, size.value.content ? (size.value.track * size.value.visible) / size.value.content : 0))
const free = computed(() => Math.max(1, size.value.track - thumb.value))
const scrollable = computed(() => Math.max(1, size.value.content - size.value.visible))
const thumbLeft = computed(() => (left.value / scrollable.value) * free.value)

onMounted(() => {
  const el = viewport.value!
  props.viewportRef?.(el)
  const measure = () => {
    size.value = {
      content: el.scrollWidth, visible: el.clientWidth, track: bar.value?.clientWidth ?? el.clientWidth,
      vertical: el.scrollHeight > el.clientHeight + 1,
    }
  }
  measure()
  observer = new ResizeObserver(measure)
  observer.observe(el)
  if (el.firstElementChild) observer.observe(el.firstElementChild)
})
onBeforeUnmount(() => { observer?.disconnect(); props.viewportRef?.(null) })

function onViewportScroll(event: Event) {
  left.value = (event.currentTarget as HTMLElement).scrollLeft
}
// A click on the track centres the thumb there.
function onTrackDown(event: PointerEvent) {
  if (!viewport.value || event.target !== event.currentTarget) return
  const x = event.clientX - (event.currentTarget as HTMLElement).getBoundingClientRect().left - thumb.value / 2
  viewport.value.scrollLeft = (Math.min(Math.max(x, 0), free.value) / free.value) * scrollable.value
}
function onThumbDown(event: PointerEvent) {
  if (!viewport.value) return
  event.stopPropagation()
  drag = { x: event.clientX, left: viewport.value.scrollLeft, ratio: scrollable.value / free.value };
  (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId)
}
function onThumbMove(event: PointerEvent) {
  if (!drag || !viewport.value) return
  viewport.value.scrollLeft = drag.left + drag.ratio * (event.clientX - drag.x)
}
function onPointerDown(event: PointerEvent) {
  if (!props.dragToScroll || event.pointerType !== "mouse" || event.button !== 0) return
  if ((event.target as Element).closest(CONTROLS)) return
  // No capture yet: capturing now would retarget the click to the viewport (rows would never get it).
  drag = { x: event.clientX, left: (event.currentTarget as HTMLElement).scrollLeft, ratio: -1 }
}
function onPointerMove(event: PointerEvent) {
  if (!drag) return
  const el = event.currentTarget as HTMLElement
  const dx = event.clientX - drag.x
  if (!drag.started) {
    if (Math.abs(dx) <= DRAG_THRESHOLD) return
    drag.started = true
    el.setPointerCapture?.(event.pointerId)
    dragging.value = true
  }
  el.scrollLeft = drag.left + drag.ratio * dx
}
// Release explicitly: a capture left behind would keep retargeting clicks to the viewport.
function stop(event: PointerEvent) {
  if (drag?.started) swallowClick = true
  const el = event.currentTarget as HTMLElement
  if (el.hasPointerCapture?.(event.pointerId)) el.releasePointerCapture(event.pointerId)
  drag = null
  dragging.value = false
}
// The click that ends a real drag is not a click on what lies under the pointer.
function onClickCapture(event: MouseEvent) {
  if (!swallowClick) return
  swallowClick = false
  event.preventDefault()
  event.stopPropagation()
}
</script>

<template>
  <div data-slot="horizontal-scroll" :class="cn('relative', props.class)">
    <div
      ref="viewport"
      data-slot="horizontal-scroll-viewport"
      v-bind="viewportProps"
      :class="cn(
        'overflow-x-auto',
        // Only the horizontal native bar goes (the sticky bar replaces it); Firefox can't target one axis,
        // so there it is hidden only when the content doesn't also scroll vertically.
        stickyScrollbar && '[&::-webkit-scrollbar:horizontal]:h-0',
        stickyScrollbar && !size.vertical && '[scrollbar-width:none]',
        dragToScroll && overflow && (dragging ? 'cursor-grabbing select-none' : 'cursor-grab'),
      )"
      @scroll="onViewportScroll"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="stop"
      @pointercancel="stop"
      @click.capture="onClickCapture"
    >
      <slot />
    </div>
    <div
      v-if="stickyScrollbar && overflow"
      ref="bar"
      data-slot="horizontal-scroll-bar"
      aria-hidden="true"
      class="sticky bottom-0 z-10 h-3 shrink-0 bg-background/80 backdrop-blur-sm"
      @pointerdown="onTrackDown"
    >
      <div
        data-slot="horizontal-scroll-thumb"
        class="absolute top-0.5 bottom-0.5 cursor-grab rounded-full bg-border transition-colors hover:bg-muted-foreground/40 active:cursor-grabbing"
        :style="{ width: `${thumb}px`, left: `${thumbLeft}px` }"
        @pointerdown="onThumbDown"
        @pointermove="onThumbMove"
        @pointerup="drag = null"
        @pointercancel="drag = null"
      />
    </div>
  </div>
</template>
