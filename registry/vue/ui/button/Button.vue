<script setup lang="ts">
import type { PrimitiveProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import type { ButtonVariants } from "."
import { Primitive } from "reka-ui"
import { cn } from "@/lib/utils"
import { Spinner } from "@/registry/vue/ui/spinner"
import { buttonVariants } from "."

interface Props extends PrimitiveProps {
  variant?: ButtonVariants["variant"]
  size?: ButtonVariants["size"]
  class?: HTMLAttributes["class"]
  /** Saqara: disables the button, marks it busy and shows a spinner before its label. */
  loading?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  as: "button",
  loading: false,
})
</script>

<template>
  <Primitive
    data-slot="button"
    :data-variant="variant"
    :data-size="size"
    :as="as"
    :as-child="asChild"
    :class="cn(buttonVariants({ variant, size }), props.class)"
    :disabled="disabled || loading"
    :aria-busy="loading || undefined"
  >
    <!-- Saqara: decorative, the label beside it is what is read out. -->
    <Spinner v-if="loading && !asChild" aria-hidden="true" role="presentation" />
    <!-- Saqara: an icon-only button swaps its icon for the spinner (the aria-label still names it). -->
    <slot v-if="!(loading && !asChild && size?.startsWith('icon'))" />
  </Primitive>
</template>
