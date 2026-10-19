<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { PlusIcon } from '@lucide/vue'
import { DropdownMenuTrigger } from '@/registry/vue/ui/dropdown-menu'
import PromptInputButton from './PromptInputButton.vue'

type DropdownMenuTriggerProps = InstanceType<typeof DropdownMenuTrigger>['$props']

interface Props extends /* @vue-ignore */ DropdownMenuTriggerProps {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
</script>

<template>
  <DropdownMenuTrigger as-child>
    <!-- Saqara: the default icon-only trigger keeps a name (a consumer aria-label wins). -->
    <PromptInputButton :class="props.class" aria-label="Plus d’actions" v-bind="props">
      <slot><PlusIcon class="size-4" /></slot>
    </PromptInputButton>
  </DropdownMenuTrigger>
</template>
