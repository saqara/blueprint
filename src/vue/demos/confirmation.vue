<script setup lang="ts">
import { ref } from "vue"
import type { ToolState } from "@/registry/vue/ui/confirmation/context"
import {
  Confirmation, ConfirmationAccepted, ConfirmationAction, ConfirmationActions, ConfirmationRejected, ConfirmationRequest, ConfirmationTitle,
} from "@/registry/vue/ui/confirmation"

const state = ref<ToolState>("approval-requested")
const approved = ref<boolean>()

function respond(ok: boolean) {
  approved.value = ok
  state.value = "approval-responded"
}
</script>

<template>
  <div class="w-full max-w-xl">
    <Confirmation :approval="approved === undefined ? { id: 'q1' } : { id: 'q1', approved }" :state="state">
      <ConfirmationTitle>
        <ConfirmationRequest>L’assistant veut exécuter une requête sur BigQuery (environ 2,1 Go analysés).</ConfirmationRequest>
        <ConfirmationAccepted>Requête autorisée : exécution en cours.</ConfirmationAccepted>
        <ConfirmationRejected>Requête refusée : rien n’a été exécuté.</ConfirmationRejected>
      </ConfirmationTitle>
      <ConfirmationActions>
        <ConfirmationAction variant="outline" @click="respond(false)">Refuser</ConfirmationAction>
        <ConfirmationAction @click="respond(true)">Autoriser</ConfirmationAction>
      </ConfirmationActions>
    </Confirmation>
  </div>
</template>
