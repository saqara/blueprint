<script setup lang="ts">
import { Dialog } from '@/registry/vue/ui/dialog'
</script>

<template>
  <Dialog v-bind="$attrs">
    <slot />
  </Dialog>
</template>
