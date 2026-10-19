<script setup lang="ts">
import type { AcceptableValue } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { Command } from '@/registry/vue/ui/command'
import { DialogContent, DialogTitle } from '@/registry/vue/ui/dialog'
import { cn } from '@/lib/utils'

interface Props {
  title?: string
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Choisir un modèle',
})
const value = defineModel<AcceptableValue | AcceptableValue[]>()
</script>

<template>
  <DialogContent
    :class="cn('p-0', props.class)"
    v-bind="$attrs"
  >
    <DialogTitle class="sr-only">
      {{ props.title }}
    </DialogTitle>
    <Command v-model="value" class="**:data-[slot=command-input-wrapper]:h-auto">
      <slot />
    </Command>
  </DialogContent>
</template>
