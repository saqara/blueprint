<script setup lang="ts">
import { Checkbox } from "@/registry/vue/ui/checkbox"
import { Label } from "@/registry/vue/ui/label"
</script>

<template>
  <div class="flex items-center gap-2">
    <Checkbox id="checkbox-cgu" :default-value="true" />
    <Label for="checkbox-cgu">J'accepte les conditions</Label>
  </div>
</template>
