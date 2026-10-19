<script setup lang="ts">
import { CheckIcon } from "@lucide/vue"
import { ref } from "vue"
import { Button } from "@/registry/vue/ui/button"
import {
  ModelSelector, ModelSelectorContent, ModelSelectorEmpty, ModelSelectorGroup, ModelSelectorInput, ModelSelectorItem, ModelSelectorList,
  ModelSelectorName, ModelSelectorTrigger,
} from "@/registry/vue/ui/model-selector"

const models = [
  { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", hint: "Analyses complexes" },
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", hint: "Rapide, usage courant" },
  { id: "gemini-2.5-flash-lite", name: "Gemini 2.5 Flash-Lite", hint: "Questions simples" },
]
const open = ref(false)
const model = ref(models[1])

function pick(m: (typeof models)[number]) {
  model.value = m
  open.value = false
}
</script>

<template>
  <ModelSelector v-model:open="open">
    <ModelSelectorTrigger as-child>
      <Button variant="outline">Modèle : {{ model.name }}</Button>
    </ModelSelectorTrigger>
    <ModelSelectorContent>
      <ModelSelectorInput placeholder="Rechercher un modèle…" />
      <ModelSelectorList>
        <ModelSelectorEmpty>Aucun modèle trouvé.</ModelSelectorEmpty>
        <ModelSelectorGroup heading="Google">
          <ModelSelectorItem v-for="m in models" :key="m.id" :value="m.name" @select="pick(m)">
            <ModelSelectorName>{{ m.name }}</ModelSelectorName>
            <span class="text-xs text-muted-foreground">{{ m.hint }}</span>
            <CheckIcon v-if="m.id === model.id" class="size-4" aria-label="Sélectionné" />
          </ModelSelectorItem>
        </ModelSelectorGroup>
      </ModelSelectorList>
    </ModelSelectorContent>
  </ModelSelector>
</template>
