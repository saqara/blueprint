<script setup lang="ts">
import { reactive, ref } from "vue"
import Wizard from "@/registry/vue/blocks/Wizard.vue"
import { Checkbox } from "@/registry/vue/ui/checkbox"
import { Field, FieldError, FieldLabel } from "@/registry/vue/ui/field"
import { Input } from "@/registry/vue/ui/input"
import { Label } from "@/registry/vue/ui/label"

type Values = { siren: string, name: string, contact: string, email: string, accepted: boolean }
const values = reactive<Values>({ siren: "", name: "", contact: "", email: "", accepted: false })
const errors = ref<Partial<Record<keyof Values, string>>>({})
const status = ref<"idle" | "submitting" | "done">("idle")

// The app owns the fields and the rules; the block asks before each step forward.
function validate(step: number) {
  const found: Partial<Record<keyof Values, string>> = {}
  if (step === 1) {
    if (!/^\d{9}$/.test(values.siren.replace(/\s/g, ""))) found.siren = "Le SIREN doit contenir 9 chiffres."
    if (!values.name.trim()) found.name = "La raison sociale est obligatoire."
  }
  if (step === 2) {
    if (!values.contact.trim()) found.contact = "Le nom du contact est obligatoire."
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) found.email = "L’e-mail n’est pas valide."
  }
  errors.value = found
  return Object.values(found)
}
function submit() {
  status.value = "submitting"
  setTimeout(() => (status.value = "done"), 1200)
}
</script>

<template>
  <div class="flex min-h-full items-start justify-center bg-muted/40 p-6">
    <Wizard
      title="Créer votre compte fournisseur" description="Trois étapes, deux minutes." :status="status" submit-label="Créer le compte"
      :can-submit="values.accepted" :validate="validate" :on-submit="submit" done-title="Compte créé"
      :steps="[{ title: 'Entreprise', description: 'SIREN et raison sociale' }, { title: 'Contact', description: 'Interlocuteur principal' }]"
    >
      <template #step-1>
        <div class="grid gap-4 sm:grid-cols-2">
          <Field :data-invalid="errors.siren ? true : undefined">
            <FieldLabel for="wizard-siren">SIREN</FieldLabel>
            <Input id="wizard-siren" v-model="values.siren" inputmode="numeric" :aria-invalid="!!errors.siren" />
            <FieldError v-if="errors.siren">{{ errors.siren }}</FieldError>
          </Field>
          <Field :data-invalid="errors.name ? true : undefined">
            <FieldLabel for="wizard-name">Raison sociale</FieldLabel>
            <Input id="wizard-name" v-model="values.name" :aria-invalid="!!errors.name" />
            <FieldError v-if="errors.name">{{ errors.name }}</FieldError>
          </Field>
        </div>
      </template>
      <template #step-2>
        <div class="grid gap-4 sm:grid-cols-2">
          <Field :data-invalid="errors.contact ? true : undefined">
            <FieldLabel for="wizard-contact">Nom et prénom</FieldLabel>
            <Input id="wizard-contact" v-model="values.contact" :aria-invalid="!!errors.contact" />
            <FieldError v-if="errors.contact">{{ errors.contact }}</FieldError>
          </Field>
          <Field :data-invalid="errors.email ? true : undefined">
            <FieldLabel for="wizard-email">E-mail</FieldLabel>
            <Input id="wizard-email" v-model="values.email" type="email" :aria-invalid="!!errors.email" />
            <FieldError v-if="errors.email">{{ errors.email }}</FieldError>
          </Field>
        </div>
      </template>
      <template #review>
        <div class="space-y-4">
          <dl class="grid gap-x-6 gap-y-2 rounded-md border p-4 text-sm sm:grid-cols-[auto_1fr]">
            <dt class="text-muted-foreground">SIREN</dt><dd>{{ values.siren }}</dd>
            <dt class="text-muted-foreground">Raison sociale</dt><dd>{{ values.name }}</dd>
            <dt class="text-muted-foreground">Contact</dt><dd>{{ values.contact }} · {{ values.email }}</dd>
          </dl>
          <div class="flex items-center gap-2">
            <Checkbox id="wizard-accept" v-model="values.accepted" />
            <Label for="wizard-accept">J’accepte les conditions d’utilisation</Label>
          </div>
        </div>
      </template>
      <template #done>
        <p>{{ values.name }} peut maintenant se connecter. Un e-mail de confirmation est parti à {{ values.email }}.</p>
      </template>
    </Wizard>
  </div>
</template>
