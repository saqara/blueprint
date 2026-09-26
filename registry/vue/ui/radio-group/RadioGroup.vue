<script setup lang="ts">
import type { AcceptableValue, RadioGroupRootEmits, RadioGroupRootProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { RadioGroupRoot, useForwardProps } from "reka-ui"
import { computed, ref } from "vue"
import { cn } from "@/lib/utils"

// Saqara: `allowDeselect` — clicking the checked item again clears the selection (value "").
const props = defineProps<RadioGroupRootProps & { class?: HTMLAttributes["class"], allowDeselect?: boolean }>()
const emits = defineEmits<RadioGroupRootEmits>()

const delegatedProps = reactiveOmit(props, "class", "allowDeselect", "modelValue", "defaultValue")
const forwarded = useForwardProps(delegatedProps)

const inner = ref<AcceptableValue | undefined>(props.defaultValue ?? "")
const value = computed(() => props.modelValue !== undefined ? props.modelValue : inner.value)
function change(next: AcceptableValue) {
  inner.value = next
  emits("update:modelValue", next)
}
function onClickCapture(event: MouseEvent) {
  const item = (event.target as Element).closest("[role=radio]")
  if (!props.allowDeselect || item?.getAttribute("aria-checked") !== "true") return
  event.preventDefault()
  event.stopPropagation()
  change("")
}
</script>

<template>
  <RadioGroupRoot
    v-slot="slotProps"
    data-slot="radio-group"
    :class="cn('grid gap-3', props.class)"
    v-bind="forwarded"
    :model-value="value"
    @update:model-value="change"
    @click.capture="onClickCapture"
  >
    <slot v-bind="slotProps" />
  </RadioGroupRoot>
</template>
