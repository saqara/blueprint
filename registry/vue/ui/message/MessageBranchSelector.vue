<script setup lang="ts">
import type { ChatRole } from './context'
import { ButtonGroup } from '@/registry/vue/ui/button-group'
import { useMessageBranchContext } from './context'

interface Props {
  from: ChatRole
}
defineProps<Props>()

const { totalBranches } = useMessageBranchContext()
</script>

<template>
  <ButtonGroup
    v-if="totalBranches > 1"
    class="[&>*:not(:first-child)]:rounded-l-md [&>*:not(:last-child)]:rounded-r-md"
    orientation="horizontal"
    v-bind="$attrs"
  >
    <slot />
  </ButtonGroup>
</template>
