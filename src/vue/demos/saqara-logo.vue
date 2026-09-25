<script setup lang="ts">
import { SaqaraLogo } from "@/registry/vue/ui/saqara-logo"
</script>

<template>
  <div class="flex items-center gap-6">
    <SaqaraLogo />
    <SaqaraLogo with-text />
    <SaqaraLogo with-text label="Saqara Hub" class="text-lg" />
  </div>
</template>
