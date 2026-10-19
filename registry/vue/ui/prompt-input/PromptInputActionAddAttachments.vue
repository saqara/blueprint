<script setup lang="ts">
import { ImageIcon } from '@lucide/vue'
import { DropdownMenuItem } from '@/registry/vue/ui/dropdown-menu'
import { usePromptInput } from './context'

type PromptInputActionAddAttachmentsProps = InstanceType<typeof DropdownMenuItem>['$props']

interface Props extends /* @vue-ignore */ PromptInputActionAddAttachmentsProps {
  label?: string
}

const props = defineProps<Props>()

const { openFileDialog } = usePromptInput()
</script>

<template>
  <DropdownMenuItem @select.prevent="openFileDialog">
    <ImageIcon class="mr-2 size-4" />
    {{ props.label || 'Ajouter des photos ou des fichiers' }}
  </DropdownMenuItem>
</template>
