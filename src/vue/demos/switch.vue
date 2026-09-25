<script setup lang="ts">
import { Label } from "@/registry/vue/ui/label"
import { Switch } from "@/registry/vue/ui/switch"
</script>

<template>
  <div class="flex items-center gap-2">
    <Switch id="switch-cron" :default-value="true" />
    <Label for="switch-cron">Synchronisation automatique</Label>
  </div>
</template>
