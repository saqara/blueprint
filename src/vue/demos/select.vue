<script setup lang="ts">
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/registry/vue/ui/select"
</script>

<template>
  <Select>
    <SelectTrigger class="w-60"><SelectValue placeholder="Département" /></SelectTrigger>
    <SelectContent>
      <SelectItem value="69">69 — Rhône</SelectItem>
      <SelectItem value="75">75 — Paris</SelectItem>
      <SelectItem value="13">13 — Bouches-du-Rhône</SelectItem>
    </SelectContent>
  </Select>
</template>
