<script setup lang="ts">
import type { QuestionOption } from "@/registry/vue/ui/question"
import { ref } from "vue"
import { Button } from "@/registry/vue/ui/button"
import { Questionnaire, type QuestionnaireStep } from "@/registry/vue/ui/questionnaire"

const steps: QuestionnaireStep[] = [
  {
    id: "effectif",
    question: "Quel est l'effectif de l'entreprise ?",
    options: [
      { value: "tpe", label: "Moins de 10 salariés" },
      { value: "pme", label: "10 à 249 salariés" },
      { value: "eti", label: "250 salariés et plus" },
    ],
  },
  {
    id: "politique",
    question: "Avez-vous une politique environnementale écrite ?",
    options: [
      { value: "oui", label: "Oui, publiée", description: "Sur le site ou dans le rapport annuel" },
      { value: "interne", label: "Oui, en interne" },
      { value: "non", label: "Pas encore" },
    ],
  },
  {
    id: "perimetre",
    question: "Sur quel périmètre porte l'évaluation ?",
    options: [
      { value: "groupe", label: "Tout le groupe" },
      { value: "filiale", label: "Une filiale" },
      { value: "site", label: "Un seul site" },
    ],
  },
]

const answers = ref<Record<string, QuestionOption> | null>(null)
const round = ref(0)
function restart() {
  answers.value = null
  round.value++
}
</script>

<template>
  <div class="w-full max-w-2xl space-y-2">
    <div v-if="answers" class="space-y-3 rounded-xl border p-4 text-sm">
      <ul class="space-y-1">
        <li v-for="s in steps" :key="s.id"><span class="text-muted-foreground">{{ s.question }}</span> {{ answers[s.id]?.label }}</li>
      </ul>
      <Button size="sm" variant="outline" @click="restart">Recommencer</Button>
    </div>
    <!-- Not on page load (the doc page keeps its focus): only when it starts again. -->
    <Questionnaire v-else :key="round" :steps="steps" :autofocus="round > 0" @complete="(a) => { answers = a }" />
    <p class="text-sm text-muted-foreground">Flèches et Entrée, ou un chiffre de 1 à 9 pour chaque question.</p>
  </div>
</template>
