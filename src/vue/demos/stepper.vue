<script setup lang="ts">
import { Check } from "@lucide/vue"
import { ref } from "vue"
import { Button } from "@/registry/vue/ui/button"
import { Stepper, StepperDescription, StepperIndicator, StepperItem, StepperSeparator, StepperTitle, StepperTrigger } from "@/registry/vue/ui/stepper"

const steps = [
  { step: 1, title: "Entreprise", description: "SIREN et raison sociale" },
  { step: 2, title: "Contacts", description: "Interlocuteurs" },
  { step: 3, title: "Validation", description: "Récapitulatif" },
]
const value = ref(2)
</script>

<template>
  <div class="space-y-4">
    <Stepper v-model="value" class="w-full max-w-xl items-start">
      <StepperItem v-for="s in steps" :key="s.step" :step="s.step" class="relative flex-1 flex-col">
        <StepperTrigger>
          <StepperIndicator><Check v-if="s.step < value" class="size-4" /><template v-else>{{ s.step }}</template></StepperIndicator>
          <StepperTitle>{{ s.title }}</StepperTitle>
          <StepperDescription>{{ s.description }}</StepperDescription>
        </StepperTrigger>
        <StepperSeparator v-if="s.step < steps.length" class="absolute top-5 right-[calc(-50%+20px)] left-[calc(50%+30px)] h-0.5" />
      </StepperItem>
    </Stepper>
    <div class="flex gap-2">
      <Button variant="outline" :disabled="value === 1" @click="value--">Précédent</Button>
      <Button :disabled="value === steps.length" @click="value++">Suivant</Button>
    </div>
  </div>
</template>
