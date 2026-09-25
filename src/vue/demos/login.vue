<script setup lang="ts">
import { ref } from "vue"
import Login from "@/registry/vue/blocks/Login.vue"

type Action = "password" | "magicLink" | "sso"
const status = ref<"idle" | "loading" | "sent">("idle")
const error = ref<string>()
const action = ref<Action>()
function wait(which: Action, then: () => void) {
  action.value = which
  status.value = "loading"
  error.value = undefined
  setTimeout(then, 800)
}
</script>

<template>
  <div class="flex min-h-full items-center justify-center bg-muted/40 p-8">
    <Login title="Saqara Hub" description="Connectez-vous pour accéder à votre espace." magic-link :sso="{ label: 'Se connecter avec SSO' }"
      :status="status" :loading-action="action" :error="error" email-placeholder="prenom.nom@exemple.fr" :resend-cooldown="30"
      @error-dismiss="error = undefined"
      @password-submit="wait('password', () => { status = 'idle'; error = 'Identifiants incorrects.' })"
      @magic-link-submit="wait('magicLink', () => (status = 'sent'))"
      @sso="wait('sso', () => { status = 'idle'; error = 'La connexion SSO a échoué. Réessayez.' })"
      @resend="() => {}" @forgot-password="() => {}" @reset="status = 'idle'" />
  </div>
</template>
