<script setup lang="ts">
import { DatabaseIcon, DotIcon, SearchIcon } from "@lucide/vue"
import {
  ChainOfThought, ChainOfThoughtContent, ChainOfThoughtHeader, ChainOfThoughtSearchResult, ChainOfThoughtSearchResults, ChainOfThoughtStep,
} from "@/registry/vue/ui/chain-of-thought"
</script>

<template>
  <ChainOfThought default-open class="w-full max-w-xl">
    <ChainOfThoughtHeader />
    <ChainOfThoughtContent>
      <ChainOfThoughtStep label="Recherche des tables utiles">
        <template #icon><SearchIcon class="size-4" /></template>
        <ChainOfThoughtSearchResults>
          <ChainOfThoughtSearchResult>entreprises</ChainOfThoughtSearchResult>
          <ChainOfThoughtSearchResult>evaluations</ChainOfThoughtSearchResult>
        </ChainOfThoughtSearchResults>
      </ChainOfThoughtStep>
      <ChainOfThoughtStep label="Exécution de la requête" description="1 284 lignes lues" status="active">
        <template #icon><DatabaseIcon class="size-4" /></template>
      </ChainOfThoughtStep>
      <ChainOfThoughtStep label="Rédaction de la réponse" status="pending">
        <template #icon><DotIcon class="size-4" /></template>
      </ChainOfThoughtStep>
    </ChainOfThoughtContent>
  </ChainOfThought>
</template>
