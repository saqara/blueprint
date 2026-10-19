<script setup lang="ts">
import { CommandItem } from '@/registry/vue/ui/command'

const props = defineProps<{
  value: string
}>()
</script>

<template>
  <CommandItem v-bind="$attrs" :value="props.value">
    <slot />
  </CommandItem>
</template>
