<script setup lang="ts">
import type { DialogContentEmits, DialogContentProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { X } from "@lucide/vue"
import { reactiveOmit } from "@vueuse/core"
import {
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  useForwardPropsEmits,
} from "reka-ui"
import { cn } from "@/lib/utils"

defineOptions({
  inheritAttrs: false,
})

const sizes = {
  default: "sm:max-w-lg",
  sm: "sm:max-w-md",
  md: "sm:max-w-2xl",
  lg: "sm:max-w-4xl",
  xl: "sm:max-w-6xl",
}

const props = withDefaults(defineProps<DialogContentProps & {
  class?: HTMLAttributes["class"]
  size?: keyof typeof sizes
  closeLabel?: string
}>(), {
  size: "default",
  closeLabel: "Fermer",
})
const emits = defineEmits<DialogContentEmits>()

const delegatedProps = reactiveOmit(props, "class", "size", "closeLabel")

const forwarded = useForwardPropsEmits(delegatedProps, emits)

let opener: HTMLElement | null = null
function rememberOpener() {
  opener = document.activeElement as HTMLElement | null
}
// Saqara: reka only refocuses a DialogTrigger; controlled ones return focus to their opener.
function returnFocus(event: Event) {
  if (event.defaultPrevented || !opener?.isConnected) return
  event.preventDefault()
  opener.focus()
}
</script>

<template>
  <DialogPortal>
    <DialogOverlay
      class="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
    >
      <DialogContent
        :class="
          cn(
            'relative z-50 grid w-full max-w-[calc(100%-2rem)] my-8 gap-4 border border-border bg-card dark:bg-background p-6 shadow-lg duration-200 sm:rounded-lg md:w-full',
            sizes[size],
            props.class,
          )
        "
        data-slot="dialog-content"
        :data-size="size"
        v-bind="{ ...$attrs, ...forwarded }"
        @open-auto-focus="rememberOpener"
        @close-auto-focus="returnFocus"
        @pointer-down-outside="(event) => {
          const originalEvent = event.detail.originalEvent;
          const target = originalEvent.target as HTMLElement;
          if (originalEvent.offsetX > target.clientWidth || originalEvent.offsetY > target.clientHeight) {
            event.preventDefault();
          }
        }"
      >
        <slot />

        <DialogClose
          class="absolute top-4 right-4 p-0.5 transition-colors rounded-md hover:bg-secondary"
        >
          <X class="w-4 h-4" />
          <span class="sr-only">{{ closeLabel }}</span>
        </DialogClose>
      </DialogContent>
    </DialogOverlay>
  </DialogPortal>
</template>
