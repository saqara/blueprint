<script setup lang="ts">
import type { PrimitiveProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import type { BadgeVariants } from "."
import { reactiveOmit } from "@vueuse/core"
import { XIcon } from "@lucide/vue"
import { Primitive } from "reka-ui"
import { cn } from "@/lib/utils"
import { badgeVariants } from "."

// Saqara: `onRemove` (@remove) adds a close button (removable chip) without making the badge taller.
const props = withDefaults(defineProps<PrimitiveProps & {
  variant?: BadgeVariants["variant"]
  class?: HTMLAttributes["class"]
  onRemove?: () => void
  removeLabel?: string
}>(), { removeLabel: "Retirer" })

const delegatedProps = reactiveOmit(props, "class", "onRemove", "removeLabel")
</script>

<template>
  <Primitive
    data-slot="badge"
    :class="cn(badgeVariants({ variant }), props.class)"
    v-bind="delegatedProps"
  >
    <slot />
    <button v-if="onRemove && !asChild" type="button" :aria-label="removeLabel"
      class="-mr-0.5 inline-grid size-3.5 place-items-center rounded-full opacity-70 outline-none hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset" @click="onRemove()">
      <XIcon aria-hidden="true" class="size-3" />
    </button>
  </Primitive>
</template>
