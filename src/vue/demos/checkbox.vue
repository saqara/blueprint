<script setup lang="ts">
import { Checkbox } from "@/registry/vue/ui/checkbox"
import { Label } from "@/registry/vue/ui/label"
</script>

<template>
  <div class="grid gap-3">
    <div class="flex items-center gap-2">
      <Checkbox id="checkbox-cgu" :default-value="true" />
      <Label for="checkbox-cgu">J'accepte les conditions</Label>
    </div>
    <div class="flex items-center gap-2">
      <Checkbox id="checkbox-all" model-value="indeterminate" />
      <Label for="checkbox-all">Tout sélectionner (2 sur 5)</Label>
    </div>
  </div>
</template>
