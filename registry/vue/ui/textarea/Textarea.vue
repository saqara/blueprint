<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { useVModel } from "@vueuse/core"
import { cn } from "@/lib/utils"

// Saqara: `rows` is a minimum height (field-sizing-content ignores it); `:auto-resize="false"` keeps a fixed height.
const props = withDefaults(defineProps<{
  class?: HTMLAttributes["class"]
  defaultValue?: string | number
  modelValue?: string | number
  rows?: number
  autoResize?: boolean
}>(), { autoResize: true })

const emits = defineEmits<{
  (e: "update:modelValue", payload: string | number): void
}>()

const modelValue = useVModel(props, "modelValue", emits, {
  passive: true,
  defaultValue: props.defaultValue,
})
</script>

<template>
  <textarea
    v-model="modelValue"
    data-slot="textarea"
    :rows="rows"
    :style="rows ? { minHeight: `calc(${rows}lh + 1rem + 2px)` } : undefined"
    :class="cn('border-input placeholder:text-muted-foreground aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex min-h-16 w-full rounded-md border bg-transparent [&[readonly]]:bg-muted/40 dark:[&[readonly]]:bg-muted/40 px-3 py-2 text-[16px] shadow-field transition-[color,border-color,box-shadow] duration-80 ease-tail outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:shadow-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm', autoResize && 'field-sizing-content', props.class)"
  />
</template>
