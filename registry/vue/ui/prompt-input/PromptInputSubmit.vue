<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import type { ChatStatus } from "./types"
import { CornerDownLeftIcon, Loader2Icon, SquareIcon, XIcon } from "@lucide/vue"
import { reactiveOmit } from "@vueuse/core"
import { computed, getCurrentInstance } from "vue"
import { InputGroupButton } from "@/registry/vue/ui/input-group"
import { cn } from "@/lib/utils"

type InputGroupButtonProps = InstanceType<typeof InputGroupButton>["$props"]

interface Props extends /* @vue-ignore */ InputGroupButtonProps {
  class?: HTMLAttributes["class"]
  status?: ChatStatus
  variant?: InputGroupButtonProps["variant"]
  size?: InputGroupButtonProps["size"]
}

const props = withDefaults(defineProps<Props>(), {
  variant: "default",
  size: "icon-sm",
})
const emit = defineEmits<{ stop: [] }>()

const delegated = reactiveOmit(props, "status", "class")
const generating = computed(() => props.status === "submitted" || props.status === "streaming")
// Saqara: like the React version, a listened @stop turns the button into "stop" while generating.
const canStop = computed(() => generating.value && !!getCurrentInstance()?.vnode.props?.onStop)
const icon = computed(() => ({ submitted: Loader2Icon, streaming: SquareIcon, error: XIcon })[props.status as string] ?? CornerDownLeftIcon)

function onClick(event: MouseEvent) {
  if (!canStop.value) return
  event.preventDefault()
  emit("stop")
}
</script>

<template>
  <InputGroupButton
    v-bind="delegated"
    :aria-label="generating ? 'Arrêter la génération' : 'Envoyer'"
    :class="cn(props.class)"
    :type="canStop ? 'button' : 'submit'"
    @click="onClick"
  >
    <slot>
      <component :is="icon" :class="cn('size-4', status === 'submitted' && 'animate-spin motion-reduce:animate-none')" />
    </slot>
  </InputGroupButton>
</template>
