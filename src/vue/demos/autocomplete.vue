<script setup lang="ts">
import type { AutocompleteOption } from "@/registry/vue/ui/autocomplete"
import { MapPinIcon } from "@lucide/vue"
import { ref, watch } from "vue"
import { Autocomplete } from "@/registry/vue/ui/autocomplete"
import { Label } from "@/registry/vue/ui/label"

const streets = ["rue de la République", "rue de la Paix", "avenue Jean Jaurès", "boulevard Vivier Merle"]
const cities = ["69002 Lyon", "75002 Paris", "69007 Lyon", "69003 Lyon"]

// Stands in for a geocoding API.
function search(query: string): Promise<AutocompleteOption[]> {
  const n = query.match(/^\d+/)?.[0] ?? "12"
  return new Promise(resolve => setTimeout(() => resolve(
    streets.filter(s => `${n} ${s}`.toLowerCase().includes(query.toLowerCase().replace(/^\d+\s*/, "").trim()) || !/[a-z]/i.test(query))
      .map((s, i) => ({ value: `${n}-${i}`, label: `${n} ${s}`, description: cities[i] }))), 400))
}

const query = ref("")
const suggestions = ref<AutocompleteOption[]>([])
const loading = ref(false)
const chosen = ref<AutocompleteOption>()

// Debounced search: the component only shows what the app passes back.
let timer: ReturnType<typeof setTimeout> | undefined
watch(query, (q) => {
  clearTimeout(timer)
  if (q.trim().length < 3) { suggestions.value = []; loading.value = false; return }
  loading.value = true
  timer = setTimeout(() => search(q).then((r) => { if (query.value === q) { suggestions.value = r; loading.value = false } }), 250)
})
function select(o: AutocompleteOption) {
  chosen.value = o
  query.value = o.label
}
</script>

<template>
  <div class="grid w-full max-w-sm gap-2">
    <Label for="adresse">Adresse du siège</Label>
    <Autocomplete id="adresse" v-model:value="query" placeholder="12 rue de la…" :min-chars="3"
      :suggestions="suggestions" :loading="loading" empty-message="Aucune adresse trouvée." :on-select="select">
      <template #icon><MapPinIcon /></template>
    </Autocomplete>
    <p class="text-sm text-muted-foreground">{{ chosen ? `${chosen.label}, ${chosen.description}` : "Saisissez au moins 3 caractères." }}</p>
  </div>
</template>
