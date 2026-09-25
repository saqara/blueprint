<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { computed, onBeforeUnmount, onMounted, ref, useId, watch } from "vue"
import { cn } from "@/lib/utils"
import { Alert, AlertClose, AlertDescription } from "@/registry/vue/ui/alert"
import { Button } from "@/registry/vue/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/registry/vue/ui/card"
import { Input } from "@/registry/vue/ui/input"
import { Label } from "@/registry/vue/ui/label"
import { Separator } from "@/registry/vue/ui/separator"
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
  /** Which button spins while `status` is "loading" (all controls stay locked). Default: the form's main method. */
  loadingAction?: "password" | "magicLink" | "sso"
  error?: string
  emailPlaceholder?: string
  emailHint?: string
  sentTitle?: string
  resetLabel?: string
  /** Seconds before the link can be resent, restarted after each resend. */
  resendCooldown?: number
  onPasswordSubmit?: (values: { email: string; password: string }) => void
  onMagicLinkSubmit?: (email: string) => void
  onSso?: () => void
  onForgotPassword?: (email: string) => void
  onReset?: () => void
  onResend?: (email: string) => void
  onErrorDismiss?: () => void
  class?: HTMLAttributes["class"]
}>(), {
  title: "Connexion", password: true, magicLink: false, status: "idle",
  sentTitle: "Vérifiez votre boîte mail", resetLabel: "Utiliser une autre adresse", resendCooldown: 60,
})

const id = useId()
const email = ref("")
const secret = ref("")
const loading = computed(() => props.status === "loading")
const spinning = computed(() => loading.value ? (props.loadingAction ?? (props.password ? "password" : "magicLink")) : undefined)
// The page has one heading: the card title is an h1 (CardTitle is a div).
const titleClass = "font-heading text-xl leading-none font-semibold"

// Countdown restarts whenever the sent screen shows; resend() restarts it too.
const wait = ref(props.resendCooldown)
let timer: ReturnType<typeof setInterval> | undefined
function startCountdown() {
  clearInterval(timer)
  if (props.status !== "sent") return
  wait.value = props.resendCooldown
  timer = setInterval(() => { wait.value = Math.max(0, wait.value - 1) }, 1000)
}
// Client only: no interval during SSR.
onMounted(startCountdown)
watch(() => props.status, startCountdown)
onBeforeUnmount(() => clearInterval(timer))

function resend() {
  wait.value = props.resendCooldown
  props.onResend?.(email.value)
}
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
      <h1 data-slot="card-title" :class="titleClass">{{ sentTitle }}</h1>
      <CardDescription>Un lien de connexion a été envoyé à <strong>{{ email || "votre adresse" }}</strong>.</CardDescription>
    </CardHeader>
    <CardContent v-if="error">
      <Alert variant="destructive" role="alert">
        <AlertDescription>{{ error }}</AlertDescription>
        <AlertClose v-if="onErrorDismiss" @click="onErrorDismiss()" />
      </Alert>
    </CardContent>
    <CardFooter v-if="onResend || onReset" class="grid gap-2">
      <Button v-if="onResend" class="w-full" :disabled="wait > 0" @click="resend">
        {{ wait > 0 ? `Renvoyer le lien dans ${wait} s` : "Renvoyer le lien" }}
      </Button>
      <Button v-if="onReset" variant="outline" class="w-full" @click="onReset()">{{ resetLabel }}</Button>
    </CardFooter>
  </Card>
  <Card v-else data-slot="login" :class="cn('w-full max-w-sm', props.class)">
    <CardHeader class="justify-items-center gap-3 text-center">
      <slot name="logo"><SaqaraLogo class="text-foreground" /></slot>
      <h1 data-slot="card-title" :class="titleClass">{{ title }}</h1>
      <CardDescription v-if="description">{{ description }}</CardDescription>
    </CardHeader>
    <CardContent class="grid gap-4">
      <Alert v-if="error" variant="destructive" role="alert">
        <AlertDescription>{{ error }}</AlertDescription>
        <AlertClose v-if="onErrorDismiss" @click="onErrorDismiss()" />
      </Alert>
      <Button v-if="sso" variant="outline" class="w-full" :disabled="loading" :loading="spinning === 'sso'" @click="onSso?.()">{{ sso.label }}</Button>
      <div v-if="sso && (password || magicLink)" class="flex items-center gap-2 text-xs text-muted-foreground">
        <Separator class="flex-1" /><span>ou</span><Separator class="flex-1" />
      </div>
      <form v-if="password || magicLink" class="grid gap-3" @submit.prevent="submit">
        <div class="grid gap-2">
          <Label :for="`${id}-email`">E-mail</Label>
          <Input :id="`${id}-email`" v-model="email" name="email" type="email" autocomplete="email" required :disabled="loading"
            :placeholder="emailPlaceholder" :aria-describedby="emailHint ? `${id}-email-hint` : undefined" />
          <p v-if="emailHint" :id="`${id}-email-hint`" class="text-xs text-muted-foreground">{{ emailHint }}</p>
        </div>
        <div v-if="password" class="grid gap-2">
          <div class="flex items-center justify-between">
            <Label :for="`${id}-password`">Mot de passe</Label>
            <button v-if="onForgotPassword" type="button" :disabled="loading" class="text-xs text-muted-foreground underline-offset-4 hover:underline disabled:opacity-50" @click="onForgotPassword(email)">
              Mot de passe oublié ?
            </button>
          </div>
          <Input :id="`${id}-password`" v-model="secret" name="password" type="password" autocomplete="current-password" required :disabled="loading" />
        </div>
        <Button v-if="password" type="submit" class="w-full" :disabled="loading" :loading="spinning === 'password'">Se connecter</Button>
        <template v-if="magicLink">
          <Button v-if="password" type="button" variant="ghost" class="w-full" :disabled="loading" :loading="spinning === 'magicLink'" @click="sendLink">Recevoir un lien de connexion</Button>
          <Button v-else type="submit" class="w-full" :disabled="loading" :loading="spinning === 'magicLink'">Recevoir un lien de connexion</Button>
        </template>
      </form>
    </CardContent>
  </Card>
</template>
