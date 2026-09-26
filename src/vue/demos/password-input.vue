<script setup lang="ts">
import { ref } from "vue"
import { Label } from "@/registry/vue/ui/label"
import { PasswordInput } from "@/registry/vue/ui/password-input"

const key = ref("sk_test_exemple")
</script>

<template>
  <div class="grid w-full max-w-sm gap-2">
    <Label for="api-key">Clé d'API Infolegale</Label>
    <PasswordInput id="api-key" v-model="key" autocomplete="off" />
  </div>
</template>
