<script setup lang="ts">
import { ref } from "vue"
import Login from "@/registry/vue/blocks/Login.vue"

const status = ref<"idle" | "loading" | "sent">("idle")
const error = ref<string>()
function wait(then: () => void) {
  status.value = "loading"
  error.value = undefined
  setTimeout(then, 800)
}
</script>

<template>
  <div class="flex min-h-full items-center justify-center bg-muted/40 p-8">
    <Login title="Portail Fournisseur" description="Connectez-vous pour accéder à votre espace." magic-link :sso="{ label: 'Se connecter avec SSO' }"
      :status="status" :error="error"
      @password-submit="wait(() => { status = 'idle'; error = 'Identifiants incorrects.' })"
      @magic-link-submit="wait(() => (status = 'sent'))"
      @sso="wait(() => { status = 'idle'; error = 'La connexion SSO a échoué. Réessayez.' })"
      @forgot-password="() => {}" @reset="status = 'idle'" />
  </div>
</template>
