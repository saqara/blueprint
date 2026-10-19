<script setup lang="ts">
import { CommandShortcut } from '@/registry/vue/ui/command'
</script>

<template>
  <CommandShortcut v-bind="$attrs">
    <slot />
  </CommandShortcut>
</template>
