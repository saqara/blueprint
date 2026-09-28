<script setup lang="ts">
import type { SliderRootEmits, SliderRootProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { SliderRange, SliderRoot, SliderThumb, SliderTrack, useForwardPropsEmits } from "reka-ui"
import { cn } from "@/lib/utils"

const props = defineProps<SliderRootProps & {
  class?: HTMLAttributes["class"]
  /** Accessible name of each thumb (reka falls back to English "Minimum" / "Maximum"). */
  thumbLabels?: string[]
  /** Saqara: ticks along the track (band thresholds…), with optional labels under them. */
  marks?: { value: number, label?: string }[]
}>()
const emits = defineEmits<SliderRootEmits>()

const delegatedProps = reactiveOmit(props, "class", "thumbLabels", "marks")

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <SliderRoot
    v-slot="{ modelValue }"
    data-slot="slider"
    :class="cn(
      'relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col',
      marks?.length && 'mb-6',
      props.class,
    )"
    v-bind="forwarded"
  >
    <SliderTrack
      data-slot="slider-track"
      class="bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5"
    >
      <SliderRange
        data-slot="slider-range"
        class="bg-primary absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
      />
    </SliderTrack>

    <SliderThumb
      v-for="(_, key) in modelValue"
      :key="key"
      :aria-label="thumbLabels?.[key]"
      data-slot="slider-thumb"
      class="bg-white border-primary ring-ring/50 block size-4 shrink-0 rounded-full border shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
    />
    <div v-if="marks?.length" aria-hidden="true" class="pointer-events-none absolute inset-x-0 top-full mt-1 h-5 text-xs text-muted-foreground">
      <span v-for="mark in marks" :key="mark.value" data-slot="slider-mark" class="absolute flex -translate-x-1/2 flex-col items-center gap-0.5"
        :style="{ left: `${((mark.value - (min ?? 0)) / ((max ?? 100) - (min ?? 0))) * 100}%` }">
        <span class="h-1.5 w-px bg-border" />
        {{ mark.label }}
      </span>
    </div>
  </SliderRoot>
</template>
