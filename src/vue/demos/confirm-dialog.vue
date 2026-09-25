<script setup lang="ts">
import { ref } from "vue"
import { Button } from "@/registry/vue/ui/button"
import { ConfirmDialog, confirm } from "@/registry/vue/ui/confirm-dialog"

const wait = (ms: number) => new Promise(r => setTimeout(r, ms))
const result = ref("Aucune réponse pour l'instant.")

async function remove() {
  const ok = await confirm({ title: "Supprimer le contact ?", message: "Cette action est définitive.", confirmText: "Supprimer", variant: "destructive" })
  result.value = ok ? "Contact supprimé." : "Suppression annulée."
}

async function send() {
  const ok = await confirm({ message: "Envoyer la demande de documents au fournisseur ?", confirmText: "Envoyer", variant: "info", onConfirm: () => wait(1500) })
  result.value = ok ? "Demande envoyée." : "Envoi annulé."
}
</script>

<template>
  <div class="flex flex-col items-center gap-3">
    <ConfirmDialog />
    <div class="flex flex-wrap gap-2">
      <Button variant="outline" @click="remove">Supprimer un contact</Button>
      <Button variant="outline" @click="send">Envoyer (asynchrone)</Button>
    </div>
    <p class="text-sm text-muted-foreground">{{ result }}</p>
  </div>
</template>
