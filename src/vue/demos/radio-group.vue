<script setup lang="ts">
import { ref } from "vue"
import { Field, FieldContent, FieldDescription, FieldLabel, FieldTitle } from "@/registry/vue/ui/field"
import { Label } from "@/registry/vue/ui/label"
import { RadioGroup, RadioGroupItem } from "@/registry/vue/ui/radio-group"

const agencies = [
  { value: "lyon", title: "Agence de Lyon", description: "Rhône, Ain, Isère" },
  { value: "lille", title: "Agence de Lille", description: "Nord, Pas-de-Calais" },
]
const agency = ref("lyon")
</script>

<template>
  <div class="grid w-full max-w-md gap-6">
    <RadioGroup default-value="conforme" aria-label="Conformité">
      <div v-for="v in ['conforme', 'partiel', 'non conforme']" :key="v" class="flex items-center gap-2">
        <RadioGroupItem :id="`radio-${v}`" :value="v" />
        <Label :for="`radio-${v}`">{{ v }}</Label>
      </div>
    </RadioGroup>
    <!-- Selectable cards: a FieldLabel wrapping a Field. allow-deselect: click the chosen card again to clear. -->
    <RadioGroup v-model="agency" allow-deselect aria-label="Agence de rattachement">
      <FieldLabel v-for="a in agencies" :key="a.value" :for="`agence-${a.value}`">
        <Field orientation="horizontal">
          <FieldContent>
            <FieldTitle>{{ a.title }}</FieldTitle>
            <FieldDescription>{{ a.description }}</FieldDescription>
          </FieldContent>
          <RadioGroupItem :id="`agence-${a.value}`" :value="a.value" />
        </Field>
      </FieldLabel>
    </RadioGroup>
    <p class="text-sm text-muted-foreground">{{ agency ? `Agence choisie : ${agency}` : "Aucune agence (sélection effacée)." }}</p>
  </div>
</template>
