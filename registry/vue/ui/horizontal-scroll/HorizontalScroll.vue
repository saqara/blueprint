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
  class?: HTMLAttributes["class"]
}>(), { stickyScrollbar: true, dragToScroll: true })

// A drag that starts on a control belongs to the control.
const CONTROLS = "a, button, input, select, textarea, label, [role=button], [role=checkbox], [contenteditable=true]"

const viewport = ref<HTMLElement>()
const bar = ref<HTMLElement>()
const size = ref({ content: 0, visible: 0, track: 0 })
const left = ref(0)
const dragging = ref(false)
const overflow = computed(() => size.value.content > size.value.visible + 1)
let drag: { x: number, left: number, ratio: number } | null = null
let observer: ResizeObserver | undefined

// Custom thumb: native overlay scrollbars (macOS) hide themselves, a sticky bar must stay visible.
const thumb = computed(() => Math.max(24, size.value.content ? (size.value.track * size.value.visible) / size.value.content : 0))
const free = computed(() => Math.max(1, size.value.track - thumb.value))
const scrollable = computed(() => Math.max(1, size.value.content - size.value.visible))
const thumbLeft = computed(() => (left.value / scrollable.value) * free.value)

onMounted(() => {
  const el = viewport.value!
  const measure = () => {
    size.value = { content: el.scrollWidth, visible: el.clientWidth, track: bar.value?.clientWidth ?? el.clientWidth }
  }
  measure()
  observer = new ResizeObserver(measure)
  observer.observe(el)
  if (el.firstElementChild) observer.observe(el.firstElementChild)
})
onBeforeUnmount(() => observer?.disconnect())

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
  const el = event.currentTarget as HTMLElement
  drag = { x: event.clientX, left: el.scrollLeft, ratio: -1 }
  el.setPointerCapture?.(event.pointerId)
  dragging.value = true
}
function onPointerMove(event: PointerEvent) {
  if (!drag) return
  (event.currentTarget as HTMLElement).scrollLeft = drag.left + drag.ratio * (event.clientX - drag.x)
}
function stop() {
  drag = null
  dragging.value = false
}
</script>

<template>
  <div data-slot="horizontal-scroll" :class="cn('relative', props.class)">
    <div
      ref="viewport"
      data-slot="horizontal-scroll-viewport"
      :class="cn(
        'overflow-x-auto',
        stickyScrollbar && '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        dragToScroll && overflow && (dragging ? 'cursor-grabbing select-none' : 'cursor-grab'),
      )"
      @scroll="onViewportScroll"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="stop"
      @pointercancel="stop"
    >
      <slot />
    </div>
    <div
      v-if="stickyScrollbar && overflow"
      ref="bar"
      data-slot="horizontal-scroll-bar"
      aria-hidden="true"
      class="sticky bottom-0 z-10 h-3 bg-background/80 backdrop-blur-sm"
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
