<script setup lang="ts">
import { DialogTrigger } from '@/registry/vue/ui/dialog'
</script>

<template>
  <DialogTrigger v-bind="$attrs">
    <slot />
  </DialogTrigger>
</template>
