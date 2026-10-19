<script setup lang="ts">
import { CommandEmpty } from '@/registry/vue/ui/command'
</script>

<template>
  <CommandEmpty v-bind="$attrs">
    <slot />
  </CommandEmpty>
</template>
