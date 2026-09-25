<script setup lang="ts">
import { ref } from "vue"
import Login from "@/registry/vue/blocks/Login.vue"

// Example: full-page sign-in for the supplier portal. Auth is simulated.
const status = ref<"idle" | "loading" | "sent">("idle")
const error = ref<string>()
function simulate(then: () => void) {
  status.value = "loading"
  error.value = undefined
  setTimeout(then, 800)
}
</script>

<template>
  <div class="flex min-h-full flex-col items-center justify-center gap-6 bg-muted/40 p-6">
    <Login
      title="Saqara Hub"
      description="Connectez-vous pour accéder à votre espace."
      magic-link
      :sso="{ label: 'Se connecter avec SSO' }"
      :status="status"
      :error="error"
      @password-submit="simulate(() => { status = 'idle'; error = 'Identifiants incorrects.' })"
      @magic-link-submit="simulate(() => (status = 'sent'))"
      @sso="simulate(() => { status = 'idle'; error = 'La connexion SSO a échoué. Réessayez.' })"
      @forgot-password="() => {}"
      @reset="status = 'idle'"
    />
    <p class="text-xs text-muted-foreground">
      © Saqara — <a href="#/exemples/connexion" class="underline-offset-4 hover:underline">Mentions légales</a> ·
      <a href="#/exemples/connexion" class="underline-offset-4 hover:underline">Confidentialité</a>
    </p>
  </div>
</template>
