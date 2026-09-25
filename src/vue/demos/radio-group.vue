<script setup lang="ts">
import { Label } from "@/registry/vue/ui/label"
import { RadioGroup, RadioGroupItem } from "@/registry/vue/ui/radio-group"
</script>

<template>
  <RadioGroup default-value="conforme">
    <div v-for="v in ['conforme', 'partiel', 'non conforme']" :key="v" class="flex items-center gap-2">
      <RadioGroupItem :id="`radio-${v}`" :value="v" />
      <Label :for="`radio-${v}`">{{ v }}</Label>
    </div>
  </RadioGroup>
</template>
