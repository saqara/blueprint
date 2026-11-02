<script setup lang="ts">
import { ref } from "vue"
import { PromptInput, PromptInputBody, PromptInputFooter, PromptInputSubmit, PromptInputTextarea, PromptInputTools } from "@/registry/vue/ui/prompt-input"
import { Question, type QuestionOption } from "@/registry/vue/ui/question"

const companies: QuestionOption[] = [
  { value: "1", label: "Carrelages du Sud-Ouest", description: "SAINT-VINCENT-DE-TYROSSE · Carrelage" },
  { value: "2", label: "Carrelages Dupont", description: "BAYONNE · Carrelage, faïence" },
  { value: "3", label: "Dupont Carrelage Services", description: "DAX · Pose de carrelage" },
  { value: "4", label: "Carrelage Atlantique", description: "ANGLET · Carrelage" },
  { value: "5", label: "Dupont & Fils", description: "MONT-DE-MARSAN · Maçonnerie, carrelage" },
  { value: "6", label: "Carrelages Landais", description: "SOUSTONS · Carrelage" },
  { value: "7", label: "SARL Dupont", description: "BIARRITZ · Revêtements de sols" },
  { value: "8", label: "Carrelage Pro 40", description: "CAPBRETON · Carrelage", disabled: true },
  { value: "9", label: "Dupont Rénovation", description: "PEYREHORADE · Rénovation" },
]

// In a chat, the question replaces the text field until the user answers, writes another answer or closes it.
const asking = ref(true)
const answer = ref("")
// Not on page load (the doc page keeps its focus): only when the question comes back.
const rounds = ref(0)
</script>

<template>
  <div class="w-full max-w-2xl space-y-2">
    <Question
      v-if="asking"
      question="Quelle entreprise cherchez-vous ?"
      :autofocus="rounds > 0"
      :options="companies"
      @select="(option) => { answer = `${option.label} (${option.description})`; asking = false }"
      @other="() => { answer = ''; asking = false }"
      @close="asking = false"
    />
    <PromptInput v-else @submit="({ text }) => { answer = text; rounds++; asking = true }">
      <PromptInputBody><PromptInputTextarea autofocus /></PromptInputBody>
      <PromptInputFooter><PromptInputTools /><PromptInputSubmit /></PromptInputFooter>
    </PromptInput>
    <p class="text-sm text-muted-foreground" aria-live="polite">{{ answer ? `Réponse : ${answer}` : "Flèches et Entrée, ou un chiffre de 1 à 9. Échap ferme." }}</p>
  </div>
</template>
