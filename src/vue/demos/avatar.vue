<script setup lang="ts">
import { Avatar, AvatarFallback } from "@/registry/vue/ui/avatar"
</script>

<template>
  <div class="flex gap-2">
    <Avatar><AvatarFallback>AB</AvatarFallback></Avatar>
    <Avatar><AvatarFallback>BS</AvatarFallback></Avatar>
  </div>
</template>
