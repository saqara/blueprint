<script setup lang="ts">
import { SearchIcon, XIcon } from "@lucide/vue"
import { ref } from "vue"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/registry/vue/ui/input-group"

const query = ref("Bâti")
</script>

<template>
  <InputGroup class="max-w-sm">
    <InputGroupInput v-model="query" aria-label="Rechercher une entreprise" placeholder="Rechercher une entreprise…" />
    <InputGroupAddon><SearchIcon /></InputGroupAddon>
    <InputGroupAddon v-if="query" align="inline-end">
      <InputGroupButton size="icon-xs" aria-label="Effacer la recherche" @click="query = ''"><XIcon /></InputGroupButton>
    </InputGroupAddon>
  </InputGroup>
</template>
