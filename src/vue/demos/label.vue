<script setup lang="ts">
import { Input } from "@/registry/vue/ui/input"
import { Label } from "@/registry/vue/ui/label"
</script>

<template>
  <div class="grid max-w-sm gap-2">
    <Label for="label-email">E-mail</Label>
    <Input id="label-email" type="email" />
  </div>
</template>
