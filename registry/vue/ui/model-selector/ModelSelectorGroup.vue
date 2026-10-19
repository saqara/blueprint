<script setup lang="ts">
import { CommandGroup } from '@/registry/vue/ui/command'
</script>

<template>
  <CommandGroup v-bind="$attrs">
    <slot />
  </CommandGroup>
</template>
