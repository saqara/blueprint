<script setup lang="ts">
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/registry/vue/ui/command"
</script>

<template>
  <Command class="max-w-sm rounded-lg border">
    <CommandInput placeholder="Rechercher un lot…" />
    <CommandList>
      <CommandEmpty>Aucun lot trouvé.</CommandEmpty>
      <CommandGroup heading="Lots">
        <CommandItem value="gros-oeuvre">Gros œuvre</CommandItem>
        <CommandItem value="electricite">Électricité</CommandItem>
        <CommandItem value="plomberie">Plomberie</CommandItem>
      </CommandGroup>
    </CommandList>
  </Command>
</template>
