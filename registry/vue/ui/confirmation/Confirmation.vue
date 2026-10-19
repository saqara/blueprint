<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { ToolState, ToolUIPartApproval } from './context'
import { Alert } from '@/registry/vue/ui/alert'
import { cn } from '@/lib/utils'
import { provide, toRef } from 'vue'
import { ConfirmationKey } from './context'

const props = defineProps<{
  approval?: ToolUIPartApproval
  state: ToolState
  class?: HTMLAttributes['class']
}>()

provide(ConfirmationKey, {
  approval: toRef(props, 'approval'),
  state: toRef(props, 'state'),
})
</script>

<template>
  <Alert
    v-if="approval && state !== 'input-streaming' && state !== 'input-available'"
    :class="cn('flex flex-col gap-2', props.class)"
    v-bind="$attrs"
  >
    <slot />
  </Alert>
</template>
