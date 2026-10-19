<script setup lang="ts">
import { computed, ref } from "vue"
import SettingsPage from "@/registry/vue/blocks/SettingsPage.vue"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/registry/vue/ui/field"
import { Input } from "@/registry/vue/ui/input"
import { Label } from "@/registry/vue/ui/label"
import { Switch } from "@/registry/vue/ui/switch"

const saved = { prenom: "Camille", nom: "Martin", email: "camille.martin@exemple.fr", raison: "Martin Équipements SAS", siret: "91234567800021", digest: true, relances: false }
const base = ref({ ...saved })
const values = ref({ ...saved })
const status = ref<"idle" | "saving" | "saved" | "error">("idle")
const dirty = computed(() => JSON.stringify(values.value) !== JSON.stringify(base.value))

const sections = [
  { id: "compte", label: "Compte", description: "Vos informations personnelles." },
  { id: "organisation", label: "Organisation", description: "Les informations légales de votre entreprise." },
  { id: "notifications", label: "Notifications", description: "Ce que vous recevez par e-mail." },
]

function cancel() {
  values.value = { ...base.value }
  status.value = "idle"
}
function save() {
  status.value = "saving"
  setTimeout(() => {
    base.value = { ...values.value }
    status.value = "saved"
  }, 800)
}
</script>

<template>
  <div class="h-[620px] overflow-auto bg-background">
    <SettingsPage
      description="Votre compte, votre organisation et vos notifications."
      :sections="sections"
      :dirty="dirty"
      :status="status"
      :warn-on-leave="false"
      :on-save="save"
      :on-cancel="cancel"
    >
      <template #compte>
        <FieldGroup>
          <div class="grid gap-4 sm:grid-cols-2">
            <Field><FieldLabel for="sp-prenom">Prénom</FieldLabel><Input id="sp-prenom" v-model="values.prenom" /></Field>
            <Field><FieldLabel for="sp-nom">Nom</FieldLabel><Input id="sp-nom" v-model="values.nom" /></Field>
          </div>
          <Field>
            <FieldLabel for="sp-email">E-mail</FieldLabel>
            <Input id="sp-email" v-model="values.email" type="email" />
            <FieldDescription>Utilisé pour la connexion et les notifications.</FieldDescription>
          </Field>
        </FieldGroup>
      </template>
      <template #organisation>
        <FieldGroup>
          <Field><FieldLabel for="sp-raison">Raison sociale</FieldLabel><Input id="sp-raison" v-model="values.raison" /></Field>
          <Field>
            <FieldLabel for="sp-siret">SIRET</FieldLabel>
            <Input id="sp-siret" v-model="values.siret" inputmode="numeric" />
            <FieldDescription>14 chiffres, sans espace.</FieldDescription>
          </Field>
        </FieldGroup>
      </template>
      <template #notifications>
        <FieldGroup>
          <div class="flex items-center justify-between gap-4">
            <Label for="sp-digest">Résumé hebdomadaire des fournisseurs</Label>
            <Switch id="sp-digest" v-model="values.digest" />
          </div>
          <div class="flex items-center justify-between gap-4">
            <Label for="sp-relances">Relances d’évaluation</Label>
            <Switch id="sp-relances" v-model="values.relances" />
          </div>
        </FieldGroup>
      </template>
    </SettingsPage>
  </div>
</template>
