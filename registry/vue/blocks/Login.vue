<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { ref, useId } from "vue"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription } from "@/registry/vue/ui/alert"
import { Button } from "@/registry/vue/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/registry/vue/ui/card"
import { Input } from "@/registry/vue/ui/input"
import { Label } from "@/registry/vue/ui/label"
import { Separator } from "@/registry/vue/ui/separator"
import { Spinner } from "@/registry/vue/ui/spinner"
import { SaqaraLogo } from "@/registry/vue/ui/saqara-logo"

// Saqara block: presentational login. The app runs the auth and drives `status` / `error`.
// Callbacks are props (bind with @password-submit, @sso…) so optional entries only show when handled.
const props = withDefaults(defineProps<{
  title?: string
  description?: string
  password?: boolean
  magicLink?: boolean
  sso?: { label: string }
  status?: "idle" | "loading" | "sent"
  error?: string
  onPasswordSubmit?: (values: { email: string; password: string }) => void
  onMagicLinkSubmit?: (email: string) => void
  onSso?: () => void
  onForgotPassword?: (email: string) => void
  onReset?: () => void
  class?: HTMLAttributes["class"]
}>(), { title: "Connexion", password: true, magicLink: false, status: "idle" })

const id = useId()
const email = ref("")
const secret = ref("")

function submit() {
  if (props.password) props.onPasswordSubmit?.({ email: email.value, password: secret.value })
  else props.onMagicLinkSubmit?.(email.value)
}
function sendLink(event: MouseEvent) {
  const input = (event.currentTarget as HTMLButtonElement).form?.elements.namedItem("email") as HTMLInputElement | null
  if (input && !input.reportValidity()) return
  props.onMagicLinkSubmit?.(email.value)
}
</script>

<template>
  <Card v-if="status === 'sent'" data-slot="login" :class="cn('w-full max-w-sm', props.class)">
    <CardHeader class="justify-items-center gap-3 text-center">
      <slot name="logo"><SaqaraLogo class="text-foreground" /></slot>
      <CardTitle class="font-heading text-xl">Vérifiez votre boîte mail</CardTitle>
      <CardDescription>Un lien de connexion a été envoyé à <strong>{{ email || "votre adresse" }}</strong>.</CardDescription>
    </CardHeader>
    <CardFooter v-if="onReset">
      <Button variant="outline" class="w-full" @click="onReset()">Utiliser une autre adresse</Button>
    </CardFooter>
  </Card>
  <Card v-else data-slot="login" :class="cn('w-full max-w-sm', props.class)">
    <CardHeader class="justify-items-center gap-3 text-center">
      <slot name="logo"><SaqaraLogo class="text-foreground" /></slot>
      <CardTitle class="font-heading text-xl">{{ title }}</CardTitle>
      <CardDescription v-if="description">{{ description }}</CardDescription>
    </CardHeader>
    <CardContent class="grid gap-4">
      <Alert v-if="error" variant="destructive" role="alert"><AlertDescription>{{ error }}</AlertDescription></Alert>
      <Button v-if="sso" variant="outline" class="w-full" :disabled="status === 'loading'" @click="onSso?.()">{{ sso.label }}</Button>
      <div v-if="sso && (password || magicLink)" class="flex items-center gap-2 text-xs text-muted-foreground">
        <Separator class="flex-1" /><span>ou</span><Separator class="flex-1" />
      </div>
      <form v-if="password || magicLink" class="grid gap-3" @submit.prevent="submit">
        <div class="grid gap-2">
          <Label :for="`${id}-email`">E-mail</Label>
          <Input :id="`${id}-email`" v-model="email" name="email" type="email" autocomplete="email" required :disabled="status === 'loading'" />
        </div>
        <div v-if="password" class="grid gap-2">
          <div class="flex items-center justify-between">
            <Label :for="`${id}-password`">Mot de passe</Label>
            <button v-if="onForgotPassword" type="button" :disabled="status === 'loading'" class="text-xs text-muted-foreground underline-offset-4 hover:underline disabled:opacity-50" @click="onForgotPassword(email)">
              Mot de passe oublié ?
            </button>
          </div>
          <Input :id="`${id}-password`" v-model="secret" name="password" type="password" autocomplete="current-password" required :disabled="status === 'loading'" />
        </div>
        <Button v-if="password" type="submit" class="w-full" :disabled="status === 'loading'"><Spinner v-if="status === 'loading'" />Se connecter</Button>
        <template v-if="magicLink">
          <Button v-if="password" type="button" variant="ghost" class="w-full" :disabled="status === 'loading'" @click="sendLink">Recevoir un lien de connexion</Button>
          <Button v-else type="submit" class="w-full" :disabled="status === 'loading'"><Spinner v-if="status === 'loading'" />Recevoir un lien de connexion</Button>
        </template>
      </form>
    </CardContent>
  </Card>
</template>
