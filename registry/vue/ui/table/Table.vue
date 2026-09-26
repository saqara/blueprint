<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"

// Saqara: framed like data-table (rounded border on the scroll container); attributes go to the <table>;
// `:container="false"` drops the wrapper (and its frame), so sticky cells can stick to an outer scroller;
// `:bordered="false"` drops the frame (a card frames it); `wrap` lets cells wrap (long messages).
defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{
  class?: HTMLAttributes["class"]
  container?: boolean
  bordered?: boolean
  wrap?: boolean
}>(), { container: true, bordered: true, wrap: false })
</script>

<template>
  <div v-if="container" data-slot="table-container" :class="cn('relative w-full overflow-auto', bordered && 'rounded-md border')">
    <table data-slot="table" v-bind="$attrs" :class="cn('w-full caption-bottom text-sm', wrap && '[&_td]:whitespace-normal', props.class)">
      <slot />
    </table>
  </div>
  <table v-else data-slot="table" v-bind="$attrs" :class="cn('w-full caption-bottom text-sm', wrap && '[&_td]:whitespace-normal', props.class)">
    <slot />
  </table>
</template>
