<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"

// Saqara: framed like data-table (rounded border on the scroll container); attributes go to the <table>;
// `:container="false"` drops the wrapper (and its frame), so sticky cells can stick to an outer scroller.
defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{
  class?: HTMLAttributes["class"]
  container?: boolean
}>(), { container: true })
</script>

<template>
  <div v-if="container" data-slot="table-container" class="relative w-full overflow-auto rounded-md border">
    <table data-slot="table" v-bind="$attrs" :class="cn('w-full caption-bottom text-sm', props.class)">
      <slot />
    </table>
  </div>
  <table v-else data-slot="table" v-bind="$attrs" :class="cn('w-full caption-bottom text-sm', props.class)">
    <slot />
  </table>
</template>
