<script setup lang="ts">
import { Input } from "@/registry/vue/ui/input"
</script>

<template>
  <div class="grid max-w-sm gap-2">
    <Input placeholder="Raison sociale" />
    <Input placeholder="SIREN" aria-invalid="true" />
    <Input placeholder="Désactivé" disabled />
  </div>
</template>
