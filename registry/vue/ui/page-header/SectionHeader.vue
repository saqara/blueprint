<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import Header from "./Header.vue"

defineProps<{ title: string, description?: string, class?: HTMLAttributes["class"] }>()
</script>

<template>
  <Header :level="2" :title="title" :description="description" :class="$props.class">
    <template v-if="$slots.description" #description><slot name="description" /></template>
    <template v-if="$slots.actions" #actions><slot name="actions" /></template>
  </Header>
</template>
