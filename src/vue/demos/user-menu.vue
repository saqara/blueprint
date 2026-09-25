<script setup lang="ts">
import { Settings } from "@lucide/vue"
import { DropdownMenuItem } from "@/registry/vue/ui/dropdown-menu"
import { UserMenu } from "@/registry/vue/ui/user-menu"
</script>

<template>
  <UserMenu name="Camille Martin" email="camille.martin@exemple.fr" @sign-out="() => {}">
    <DropdownMenuItem><Settings />Mon profil</DropdownMenuItem>
  </UserMenu>
</template>
