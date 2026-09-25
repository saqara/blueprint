<script setup lang="ts">
import { ref } from "vue"
import { Label } from "@/registry/vue/ui/label"
import { TagInput } from "@/registry/vue/ui/tag-input"

const LOTS = ["Gros œuvre", "Électricité", "Plomberie", "Menuiserie", "Peinture", "Charpente", "Couverture", "Carrelage"]
const emails = ref(["alexandre.brochot@saqara.com"])
const lots = ref(["Plomberie"])
</script>

<template>
  <div class="grid w-full max-w-md gap-6">
    <div class="grid gap-2">
      <Label for="tag-emails">Destinataires (saisie libre)</Label>
      <TagInput id="tag-emails" v-model="emails" placeholder="Ajouter une adresse…" />
    </div>
    <div class="grid gap-2">
      <Label for="tag-lots">Lots (catalogue, création autorisée)</Label>
      <TagInput id="tag-lots" v-model="lots" :suggestions="LOTS" placeholder="Rechercher un lot…" />
    </div>
  </div>
</template>
