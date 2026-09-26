<script setup lang="ts">
import { SearchIcon } from "@lucide/vue"
import { Button } from "@/registry/vue/ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/registry/vue/ui/input-group"
import { ListToolbar } from "@/registry/vue/ui/list-toolbar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/registry/vue/ui/select"
</script>

<template>
  <div class="w-full max-w-3xl">
    <ListToolbar>
      <template #search>
        <InputGroup>
          <InputGroupInput aria-label="Rechercher une entreprise" placeholder="Rechercher une entreprise…" />
          <InputGroupAddon><SearchIcon /></InputGroupAddon>
        </InputGroup>
      </template>
      <template #filters>
        <Select default-value="all">
          <SelectTrigger class="w-44" aria-label="Statut"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="qualified">Qualifiées</SelectItem>
            <SelectItem value="pending">À compléter</SelectItem>
          </SelectContent>
        </Select>
      </template>
      <template #actions><Button>Ajouter une entreprise</Button></template>
    </ListToolbar>
  </div>
</template>
