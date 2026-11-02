<script setup lang="ts">
import type { DialogContentEmits, DialogContentProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { X } from "@lucide/vue"
import { reactiveOmit } from "@vueuse/core"
import {
  DialogClose,
  DialogContent,
  DialogPortal,
  useForwardPropsEmits,
} from "reka-ui"
import { cn } from "@/lib/utils"
import DialogOverlay from "./DialogOverlay.vue"

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
  showCloseButton?: boolean
  closeLabel?: string
}>(), {
  size: "default",
  showCloseButton: true,
  closeLabel: "Fermer",
})
const emits = defineEmits<DialogContentEmits>()

const delegatedProps = reactiveOmit(props, "class", "size", "showCloseButton", "closeLabel")

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
    <DialogOverlay />
    <DialogContent
      data-slot="dialog-content"
      :data-size="size"
      v-bind="{ ...$attrs, ...forwarded }"
      @open-auto-focus="rememberOpener"
      @close-auto-focus="returnFocus"
      :class="
        cn(
          'bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-97 data-[state=open]:zoom-in-97 fixed top-[50%] left-[50%] z-50 flex max-h-[calc(100dvh-2rem)] w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] flex-col gap-4 overflow-y-auto rounded-xl border p-6 shadow-xl duration-250 ease-spring-bounce data-[state=closed]:duration-160 data-[state=closed]:ease-in',
          sizes[size],
          props.class,
        )"
    >
      <slot />

      <DialogClose
        v-if="showCloseButton"
        data-slot="dialog-close"
        class="data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 hover:opacity-100 disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 transition-opacity duration-80 outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <X />
        <span class="sr-only">{{ closeLabel }}</span>
      </DialogClose>
    </DialogContent>
  </DialogPortal>
</template>
