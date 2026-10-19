<script setup lang="ts">
import { CommandList } from '@/registry/vue/ui/command'
</script>

<template>
  <CommandList v-bind="$attrs">
    <slot />
  </CommandList>
</template>
