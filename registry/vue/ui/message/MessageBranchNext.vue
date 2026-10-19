<script setup lang="ts">
import { ChevronRightIcon } from '@lucide/vue'
import { Button } from '@/registry/vue/ui/button'
import { useMessageBranchContext } from './context'

const { goToNext, totalBranches } = useMessageBranchContext()
</script>

<template>
  <Button
    aria-label="Version suivante"
    :disabled="totalBranches <= 1"
    size="icon-sm"
    type="button"
    variant="ghost"
    v-bind="$attrs"
    @click="goToNext"
  >
    <slot>
      <ChevronRightIcon :size="14" />
    </slot>
  </Button>
</template>
