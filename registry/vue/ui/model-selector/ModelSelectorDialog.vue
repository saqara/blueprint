<script setup lang="ts">
import { CommandDialog } from '@/registry/vue/ui/command'
</script>

<template>
  <CommandDialog v-bind="$attrs">
    <slot />
  </CommandDialog>
</template>
