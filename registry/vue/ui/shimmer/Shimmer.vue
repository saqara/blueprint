<script setup lang="ts">
import type { CSSProperties, HTMLAttributes } from "vue"
import { computed, onBeforeUnmount, onMounted, ref, useSlots, watch } from "vue"
import { cn } from "@/lib/utils"

const props = withDefaults(defineProps<{
  as?: keyof HTMLElementTagNameMap
  class?: HTMLAttributes["class"]
  /** Seconds per sweep. */
  duration?: number
  /** Width of the highlight, in px per character. */
  spread?: number
}>(), { as: "p", duration: 2, spread: 2 })

const slots = useSlots()
const length = computed(() => (slots.default?.() ?? []).reduce((n, v) => n + (typeof v.children === "string" ? v.children.length : 0), 0))
const style = computed((): CSSProperties => ({
  "--spread": `${length.value * props.spread}px`,
  "backgroundImage": "var(--bg), linear-gradient(var(--color-muted-foreground), var(--color-muted-foreground))",
}))

// Saqara: AI Elements' shimmer without motion-v — the Web Animations API sweeps the highlight, and
// nothing moves under prefers-reduced-motion (the text stays readable in muted-foreground).
const el = ref<HTMLElement>()
let animation: Animation | undefined
function start() {
  animation?.cancel()
  if (!el.value?.animate || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return
  animation = el.value.animate([{ backgroundPosition: "100% center" }, { backgroundPosition: "0% center" }], { duration: props.duration * 1000, iterations: Infinity, easing: "linear" })
}
onMounted(start)
watch(() => props.duration, start)
onBeforeUnmount(() => animation?.cancel())
</script>

<template>
  <component
    :is="as"
    ref="el"
    data-slot="shimmer"
    :class="cn(
      'relative inline-block bg-[length:250%_100%,auto] bg-clip-text text-transparent [background-position:100%_center]',
      '[--bg:linear-gradient(90deg,#0000_calc(50%-var(--spread)),var(--color-background),#0000_calc(50%+var(--spread)))] [background-repeat:no-repeat,padding-box]',
      props.class,
    )"
    :style="style"
  >
    <slot />
  </component>
</template>
