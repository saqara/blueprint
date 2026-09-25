<script lang="ts">
export type Values = { siren: string; name: string; category: string; logo: File[]; contactName: string; email: string; phone: string; accepted: boolean }
export type Errors = Partial<Record<keyof Values, string>>

export function stepErrors(step: number, v: Values): Errors {
  const errors: Errors = {}
  if (step === 1) {
    if (!/^\d{9}$/.test(v.siren.replace(/\s/g, ""))) errors.siren = "Le SIREN doit contenir 9 chiffres."
    if (!v.name.trim()) errors.name = "La raison sociale est obligatoire."
  }
  if (step === 2) {
    if (!v.contactName.trim()) errors.contactName = "Le nom du contact est obligatoire."
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) errors.email = "L'e-mail n'est pas valide."
  }
  return errors
}
</script>

<script setup lang="ts">
import type { FileRejection } from "@/registry/vue/ui/file-dropzone"
import { Check } from "@lucide/vue"
import { reactive, ref } from "vue"
import { toast } from "vue-sonner"
import { Button } from "@/registry/vue/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/registry/vue/ui/card"
import { Checkbox } from "@/registry/vue/ui/checkbox"
import { Field, FieldError, FieldLabel } from "@/registry/vue/ui/field"
import { FileDropzone } from "@/registry/vue/ui/file-dropzone"
import { Input } from "@/registry/vue/ui/input"
import { Label } from "@/registry/vue/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/registry/vue/ui/select"
import { Toaster } from "@/registry/vue/ui/sonner"
import { Stepper, StepperDescription, StepperIndicator, StepperItem, StepperSeparator, StepperTitle, StepperTrigger } from "@/registry/vue/ui/stepper"

// Example: supplier sign-up in three steps. The app mounts <Toaster /> once at its root (here, the example's own root).
const empty = (): Values => ({ siren: "", name: "", category: "", logo: [], contactName: "", email: "", phone: "", accepted: false })
const CATEGORIES = ["Gros œuvre", "Second œuvre", "Bureau d'études", "Fournitures"]
const STEPS = [
  { step: 1, title: "Entreprise", description: "SIREN et raison sociale" },
  { step: 2, title: "Contacts", description: "Interlocuteur principal" },
  { step: 3, title: "Validation", description: "Récapitulatif" },
]
const reasons = { type: "format non accepté", size: "fichier trop lourd (2 Mo max.)" }

const step = ref(1)
const values = reactive<Values>(empty())
const errors = ref<Errors>({})

function goTo(next: number | undefined) {
  if (next === undefined) return
  if (next > step.value) {
    errors.value = stepErrors(step.value, values)
    if (Object.keys(errors.value).length) return
  }
  step.value = next
}
function submit() {
  toast.success("Compte créé", { description: `${values.name} peut maintenant se connecter.` })
  Object.assign(values, empty())
  errors.value = {}
  step.value = 1
}
const onReject = (rejections: FileRejection[]) => rejections.forEach(({ file, reason }) => toast.error(`${file.name} : ${reasons[reason]}`))
</script>

<template>
  <div class="flex min-h-full justify-center bg-muted/40 p-6">
    <Toaster />
    <Card class="w-full max-w-2xl self-start">
      <CardHeader>
        <CardTitle class="font-heading text-xl">Créer votre compte fournisseur</CardTitle>
        <CardDescription>Trois étapes, deux minutes.</CardDescription>
      </CardHeader>
      <CardContent class="space-y-8">
        <Stepper :model-value="step" class="w-full items-start" @update:model-value="goTo">
          <StepperItem v-for="s in STEPS" :key="s.step" :step="s.step" class="relative flex-1 flex-col">
            <StepperTrigger>
              <StepperIndicator><Check v-if="s.step < step" class="size-4" /><template v-else>{{ s.step }}</template></StepperIndicator>
              <StepperTitle>{{ s.title }}</StepperTitle>
              <StepperDescription>{{ s.description }}</StepperDescription>
            </StepperTrigger>
            <StepperSeparator v-if="s.step < STEPS.length" class="absolute top-5 right-[calc(-50%+20px)] left-[calc(50%+30px)] h-0.5" />
          </StepperItem>
        </Stepper>

        <div v-if="step === 1" class="grid gap-4 sm:grid-cols-2">
          <Field :data-invalid="errors.siren ? true : undefined">
            <FieldLabel for="siren">SIREN</FieldLabel>
            <Input id="siren" v-model="values.siren" inputmode="numeric" :aria-invalid="!!errors.siren" />
            <FieldError v-if="errors.siren">{{ errors.siren }}</FieldError>
          </Field>
          <Field :data-invalid="errors.name ? true : undefined">
            <FieldLabel for="name">Raison sociale</FieldLabel>
            <Input id="name" v-model="values.name" :aria-invalid="!!errors.name" />
            <FieldError v-if="errors.name">{{ errors.name }}</FieldError>
          </Field>
          <Field>
            <FieldLabel for="category">Catégorie</FieldLabel>
            <Select v-model="values.category">
              <SelectTrigger id="category" class="w-full"><SelectValue placeholder="Choisir une catégorie" /></SelectTrigger>
              <SelectContent><SelectItem v-for="c in CATEGORIES" :key="c" :value="c">{{ c }}</SelectItem></SelectContent>
            </Select>
          </Field>
          <div class="sm:col-span-2">
            <FileDropzone v-model:files="values.logo" accept="image/png,image/jpeg,image/webp,image/svg+xml" :max-size="2 * 1024 * 1024"
              label="Logo de l'entreprise (PNG, JPEG, WebP, SVG — 2 Mo max.)" @reject="onReject" />
          </div>
        </div>

        <div v-else-if="step === 2" class="grid gap-4 sm:grid-cols-2">
          <Field :data-invalid="errors.contactName ? true : undefined" class="sm:col-span-2">
            <FieldLabel for="contact">Nom et prénom</FieldLabel>
            <Input id="contact" v-model="values.contactName" :aria-invalid="!!errors.contactName" />
            <FieldError v-if="errors.contactName">{{ errors.contactName }}</FieldError>
          </Field>
          <Field :data-invalid="errors.email ? true : undefined">
            <FieldLabel for="email">E-mail</FieldLabel>
            <Input id="email" v-model="values.email" type="email" :aria-invalid="!!errors.email" />
            <FieldError v-if="errors.email">{{ errors.email }}</FieldError>
          </Field>
          <Field>
            <FieldLabel for="phone">Téléphone (facultatif)</FieldLabel>
            <Input id="phone" v-model="values.phone" type="tel" />
          </Field>
        </div>

        <div v-else class="space-y-4">
          <dl class="grid gap-x-6 gap-y-2 rounded-md border p-4 text-sm sm:grid-cols-[auto_1fr]">
            <dt class="text-muted-foreground">SIREN</dt><dd>{{ values.siren }}</dd>
            <dt class="text-muted-foreground">Raison sociale</dt><dd>{{ values.name }}</dd>
            <dt class="text-muted-foreground">Catégorie</dt><dd>{{ values.category || "—" }}</dd>
            <dt class="text-muted-foreground">Logo</dt><dd>{{ values.logo[0]?.name ?? "—" }}</dd>
            <dt class="text-muted-foreground">Contact</dt><dd>{{ values.contactName }} · {{ values.email }}<template v-if="values.phone"> · {{ values.phone }}</template></dd>
          </dl>
          <div class="flex items-center gap-2">
            <Checkbox id="accept" v-model="values.accepted" />
            <Label for="accept">J'accepte les conditions d'utilisation</Label>
          </div>
        </div>
      </CardContent>
      <CardFooter class="justify-between">
        <Button variant="outline" :disabled="step === 1" @click="goTo(step - 1)">Précédent</Button>
        <Button v-if="step < STEPS.length" @click="goTo(step + 1)">Suivant</Button>
        <Button v-else :disabled="!values.accepted" @click="submit">Créer le compte</Button>
      </CardFooter>
    </Card>
  </div>
</template>
