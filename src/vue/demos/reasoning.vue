<script setup lang="ts">
import { Reasoning, ReasoningContent, ReasoningTrigger } from "@/registry/vue/ui/reasoning"
</script>

<template>
  <div class="w-full max-w-xl space-y-6">
    <Reasoning is-streaming>
      <ReasoningTrigger />
      <ReasoningContent>
        <p>La question porte sur les fournisseurs <strong>actifs</strong> : je filtre sur <code>statut = 'actif'</code>, puis je regroupe par ville.</p>
      </ReasoningContent>
    </Reasoning>
    <Reasoning :duration="4" :default-open="false">
      <ReasoningTrigger />
      <ReasoningContent>
        <p>J’ai comparé les notes moyennes par catégorie avant de répondre.</p>
      </ReasoningContent>
    </Reasoning>
  </div>
</template>
