<script setup lang="ts">
import {
  Context, ContextCacheUsage, ContextContent, ContextContentBody, ContextContentFooter, ContextContentHeader, ContextInputUsage,
  ContextOutputUsage, ContextReasoningUsage, ContextTrigger,
} from "@/registry/vue/ui/context"

// Gemini 2.5 Pro: 1 048 576 tokens of context. The app computes the costs from its own pricing.
const usage = { inputTokens: 42_300, outputTokens: 3_900, reasoningTokens: 1_800, cachedInputTokens: 12_000 }
const costs = { input: 0.053, output: 0.039, reasoning: 0.018, cache: 0.004, total: 0.114 }
</script>

<template>
  <Context :used-tokens="48_000" :max-tokens="1_048_576" :usage="usage" :costs="costs">
    <ContextTrigger />
    <ContextContent>
      <ContextContentHeader />
      <ContextContentBody>
        <ContextInputUsage />
        <ContextOutputUsage />
        <ContextReasoningUsage />
        <ContextCacheUsage />
      </ContextContentBody>
      <ContextContentFooter />
    </ContextContent>
  </Context>
</template>
