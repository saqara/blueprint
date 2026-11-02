<script setup lang="ts">
import type { PaginationListProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { PaginationList } from "reka-ui"
import { cn } from "@/lib/utils"
import { FluidHighlight } from "@/registry/vue/lib/fluid-hover"

const props = defineProps<PaginationListProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")
</script>

<template>
  <PaginationList
    v-slot="slotProps"
    data-slot="pagination-content"
    v-bind="delegatedProps"
    :class="cn('relative isolate flex flex-row items-center gap-1 [&_:is(a,button):not([aria-current]):hover]:bg-transparent', props.class)"
  >
    <FluidHighlight mode="pointer" items="a, button" class="rounded-md bg-accent" />
    <slot v-bind="slotProps" />
  </PaginationList>
</template>
