<script setup lang="ts">
import { Button } from "@/registry/vue/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/registry/vue/ui/dropdown-menu"
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child><Button variant="outline">Actions</Button></DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuLabel>Bâti Sud SAS</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem>Voir la fiche</DropdownMenuItem>
      <DropdownMenuItem>Ajouter aux favoris</DropdownMenuItem>
      <DropdownMenuItem variant="destructive">Retirer de la liste</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
